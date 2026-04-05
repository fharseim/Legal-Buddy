/**
 * POST /api/ingest-legal-docs
 *
 * Fetches German court decisions from Open Legal Data (de.openlegaldata.io),
 * embeds them with Google gemini-embedding-001, and stores in Supabase pgvector.
 *
 * Body params:
 *   area      – label for the legal_area column (default 'Allgemeines Recht')
 *   count     – decisions to fetch per run (default 10)
 *   offset    – numeric offset into the ID-ordered dataset (default 0)
 *               Use multiples of 10 (0, 10, 20 … 352000) to get unique docs
 *   secret    – INGESTION_SECRET env var for protection
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = process.env.SUPABASE_URL      ?? process.env.VITE_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY    ?? process.env.VITE_GEMINI_API_KEY ?? '';
const INGESTION_SECRET = process.env.INGESTION_SECRET  ?? '';

const OLDP_BASE   = 'https://de.openlegaldata.io/api';
const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMS  = 768;
const MAX_CONTENT = 1800;

interface OldpCase {
  id: number;
  slug: string;
  file_number: string;
  date: string;
  court: { name: string } | string;
  content?: string;
  abstract?: string;
  source_url?: string;
}
interface OldpResponse { count: number; results: OldpCase[]; }

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim().slice(0, MAX_CONTENT);
}

function courtName(c: OldpCase['court']): string {
  if (!c) return 'Unbekannt';
  return typeof c === 'string' ? c : c.name ?? 'Unbekannt';
}

async function embedText(text: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: EMBED_DIMS }),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Embed ${res.status}: ${e.slice(0,200)}`); }
  const data = await res.json();
  const values: number[] = data?.embedding?.values ?? [];
  if (!values.length) throw new Error('Empty embedding');
  return values;
}

/**
 * KEY FIX: ordering=id ensures each offset window returns genuinely different docs.
 * Previous search-based approach always returned the same 10 most-recent cases.
 */
async function fetchCases(offset: number, limit: number): Promise<OldpResponse> {
  const params = new URLSearchParams({ ordering: 'id', limit: String(limit), offset: String(offset), format: 'json' });
  const res = await fetch(`${OLDP_BASE}/cases/?${params}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'LegalBuddy/1.0' },
  });
  if (!res.ok) throw new Error(`OLDP ${res.status}: ${res.statusText}`);
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-ingestion-secret'] ?? req.body?.secret;
  if (INGESTION_SECRET && secret !== INGESTION_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  if (!GEMINI_API_KEY)   return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const area   = (req.body?.area   ?? 'Allgemeines Recht') as string;
  const count  = Math.min(Number(req.body?.count  ?? 10), 50);
  const offset = Number(req.body?.offset ?? 0);

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  let fetched = 0, inserted = 0, skipped = 0;
  const errors: string[] = [];

  try {
    const page = await fetchCases(offset, count);
    fetched = page.results?.length ?? 0;

    for (const doc of page.results ?? []) {
      try {
        const raw = doc.content ?? doc.abstract ?? '';
        if (!raw.trim()) { skipped++; continue; }

        const content = cleanText(raw);
        const court   = courtName(doc.court);
        const docUrl  = doc.source_url ?? `${OLDP_BASE}/cases/${doc.slug}/`;
        const toEmbed = `${court} ${doc.date ?? ''}\nAktenzeichen: ${doc.file_number ?? ''}\nRechtsgebiet: ${area}\n\n${content}`;

        const embedding = await embedText(toEmbed);

        const { error } = await sb.from('legal_documents').upsert(
          {
            doc_type:      'court_decision',
            source:        'openlegaldata',
            title:         `${court} – ${doc.file_number ?? doc.slug}`,
            content,
            court,
            decision_date: doc.date || null,
            file_number:   doc.file_number || null,
            legal_area:    area,
            url:           docUrl,
            embedding:     `[${embedding.join(',')}]`,
          },
          { onConflict: 'url' }
        );

        if (error) { errors.push(`Doc ${doc.id}: ${error.message}`); skipped++; }
        else inserted++;

        await new Promise(r => setTimeout(r, 150));
      } catch (e) { errors.push(`Doc ${doc.id ?? '?'}: ${e}`); skipped++; }
    }

    return res.status(200).json({ ok: true, area, offset, total_available: page.count, fetched, inserted, skipped, errors: errors.slice(0, 10) });
  } catch (err) {
    console.error('[ingest-legal-docs]', err);
    return res.status(500).json({ error: String(err) });
  }
}
