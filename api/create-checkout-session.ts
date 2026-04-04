import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
} as any);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, userEmail } = req.body as { userId?: string; userEmail?: string };
  if (!userId || !userEmail) return res.status(400).json({ error: 'Missing userId or userEmail' });
  const appUrl = process.env.APP_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000');
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      locale: 'de',
      line_items: [{ price_data: { currency: 'eur', unit_amount: 990, product_data: { name: 'Rechtsfall-Analyse', description: '1x KI-Analyse + anwaltliche Pruefung. Ergebnis in 24 Stunden.', images: [] } }, quantity: 1 }],
      metadata: { userId, credits: '1' },
      success_url: appUrl + '/profile?tab=billing&payment=success',
      cancel_url: appUrl + '/case-intake?payment=cancelled',
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] create-checkout-session error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
            }
