/**
 * POST /api/ingest-legal-docs
 *
 * Fetches German court decisions from Open Legal Data (openlegaldata.io),
 * embeds them with Google text-embedding-004 (v1 REST API), and stores
 * them in Supabase pgvector.
 *
 * Body: { area?: string, count?: number, offset?: number }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL     ?? process.env.VITE_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY   ?? process.env.VITE_GEMINI_API_KEY ?? '';
const INGESTION_SECRET = process.env.INGESTION_SECRET ?? '';

const OLDP_BASE   = 'https://de.openlegaldata.io/api';
const MAX_CONTENT = 1800;

// ── Types ─────────────────────────────────────────────────────────────────────
interface OldpCase {
  id: number;
  slug: string;
  file_number: string;
  date: string;
  created_at: string;
  updated_at: string;
  type: string | null;
  content: string;
  source_url: string | null;
  court: { id: number; name: string; code: string; jurisdiction: string; level: string; };
  tags: string[];
}

interface OldpResponse {
  count: number;
  next: string | null;
  results: OldpCase[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTENT);
}

function mapLegalArea(tags: string[]): string {
  if (!tags?.length) return 'Allgemeines Recht';
  const t = tags.join(' ').toLowerCase();
  if (t.includes('miet'))         return 'Mietrecht';
  if (t.includes('arbeit'))       return 'Arbeitsrecht';
  if (t.includes('verbraucher'))  return 'Verbraucherrecht';
  if (t.includes('vertrags'))     return 'Vertragsrecht';
  if (t.includes('familien'))     return 'Familienrecht';
  if (t.includes('erb'))          return 'Erbrecht';
  if (t.includes('handels'))      return 'Handelsrecht';
  if (t.includes('straf'))        return 'Strafrecht';
  if (t.includes('verwaltung'))   return 'Verwaltungsrecht';
  if (t.includes('steuer'))       return 'Steuerrecht';
  if (t.includes('gesellschaft')) return 'Gesellschaftsrecht';
  return tags[0] ?? 'Allgemeines Recht';
}

/** Embed using Gemini v1 REST API directly (avoids v1beta SDK limitation) */
async function embedText(apiKey: string, text: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embed API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const values: number[] = data?.embedding?.values ?? [];
  if (!values.length) throw new Error('Empty embedding returned');
  return values;
}

/** Fetch one page of cases from Open Legal Data */
async function fetchCases(search: string, limit: number, offset: number): Promise<OldpResponse> {
  const params = new URLSearchParams({
    search, limit: String(limit), offset: String(offset), format: 'json',
  });
  const res = await fetch(`${OLDP_BASE}/cases/?${params}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'LegalBuddy/1.0' },
  });
  if (!res.ok) throw new Error(`OLDP API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-ingestion-secret'] ?? req.body?.secret;
  if (INGESTION_SECRET && secret !== INGESTION_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });

  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  if (!GEMINI_API_KEY)   return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const area   = (req.body?.area ?? '') as string;
  const count  = Math.min(Number(req.body?.count  ?? 50), 200);
  const offset = Number(req.body?.offset ?? 0);

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const searchQuery = area
    ? `${area} Urteil`
    : 'Urteil Schadensersatz Vertrag Kuendigung';

  let inserted = 0;
  let skipped  = 0;
  const errors: string[] = [];

  try {
    const page = await fetchCases(searchQuery, count, offset);

    for (const doc of page.results ?? []) {
      try {
        const raw = doc.content ?? '';
        if (!raw.trim()) { skipped++; continue; }

        const content    = cleanText(raw);
        const courtName  = doc.court?.name ?? 'Unbekanntes Gericht';
        const legalArea  = mapLegalArea(doc.tags ?? []);
        const docUrl     = doc.source_url ?? `https://de.openlegaldata.io/case/${doc.slug}/`;

        const textToEmbed = `${courtName} ${doc.date} ${doc.file_number}\n\nRechtsgebiet: ${legalArea}\n\n${content}`;
        const embedding   = await embedText(GEMINI_API_KEY, textToEmbed);

        const { error } = await sb.from('legal_documents').upsert({
          doc_type:      'court_decision',
          source:        'openlegaldata',
          title:         `${courtName} ${doc.date} – ${doc.file_number}`,
          content,
          court:         courtName,
          decision_date: doc.date || null,
          file_number:   doc.file_number || null,
          legal_area:    legalArea,
          url:           docUrl,
          embedding:     `[${embedding.join(',')}]`,
        }, { onConflict: 'url' });

        if (error) errors.push(`Doc ${doc.id}: ${error.message}`);
        else inserted++;

        await new Promise(r => setTimeout(r, 150));
      } catch (docErr) {
        errors.push(`Doc ${doc.id}: ${String(docErr)}`);
        skipped++;
      }
    }

    return res.status(200).json({
      ok: true, area: area || 'all',
      fetched: page.results?.length ?? 0,
      total_available: page.count,
      inserted, skipped,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    console.error('[ingest-legal-docs]', err);
    return res.status(500).json({ error: String(err) });
  }
}
