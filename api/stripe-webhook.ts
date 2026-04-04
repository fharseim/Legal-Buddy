import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' } as any);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });
  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig as string, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits ?? '1', 10);
    if (!userId) return res.status(200).json({ received: true });
    const { error: rpcError } = await supabaseAdmin.rpc('add_credits', { p_user_id: userId, p_amount: credits });
    if (rpcError) { console.error('[Stripe] Failed to add credits:', rpcError); return res.status(500).json({ error: 'Failed to update credits' }); }
    await supabaseAdmin.from('credit_purchases').insert({ user_id: userId, stripe_session_id: session.id, amount_cents: session.amount_total, credits_added: credits, paid_at: new Date().toISOString() });
    console.log('[Stripe] Added ' + credits + ' credit(s) to user ' + userId);
  }
  return res.status(200).json({ received: true });
}
