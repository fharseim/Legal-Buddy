/**
 * POST /api/ingest-legal-docs
 *
 * Fetches German court decisions from Open Legal Data (openlegaldata.io),
 * embeds them with Google text-embedding-004, and stores in Supabase pgvector.
 *
 * Body: { area?: string, count?: number, offset?: number }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const SUPABASE_URL     = process.env.SUPABASE_URL      ?? process.env.VITE_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY    ?? process.env.VITE_GEMINI_API_KEY ?? '';
const INGESTION_SECRET = process.env.INGESTION_SECRET  ?? '';

const OLDP_BASE  = 'https://de.openlegaldata.io/api';
const EMBED_MODEL = 'text-embedding-004';
const MAX_CONTENT = 1800;

interface OldpCase {
  id: number;
  slug: string;
  file_number: string;
  date: string;
  created_at: string;
  updated_at: string;
  type: string;
  content: string;
  abstract: string;
  court: { name: string; alias: string; city: string; state: string };
  tags: string[];
  source_url?: string;
}

interface OldpResponse {
  count: number;
  next: string | null;
  results: OldpCase[];
}

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

function mapLegalArea(tags: string[], courtName: string): string {
  const combined = [...tags, courtName].join(' ').toLowerCase();
  if (combined.includes('miet'))         return 'Mietrecht';
  if (combined.includes('arbeit'))       return 'Arbeitsrecht';
  if (combined.includes('verbraucher'))  return 'Verbraucherrecht';
  if (combined.includes('vertrags'))     return 'Vertragsrecht';
  if (combined.includes('familien'))     return 'Familienrecht';
  if (combined.includes('erb'))          return 'Erbrecht';
  if (combined.includes('handels'))      return 'Handelsrecht';
  if (combined.includes('straf'))        return 'Strafrecht';
  if (combined.includes('verwaltung'))   return 'Verwaltungsrecht';
  if (combined.includes('steuer'))       return 'Steuerrecht';
  if (combined.includes('gesellschaft')) return 'Gesellschaftsrecht';
  return tags[0] ?? 'Allgemeines Recht';
}

async function embedText(ai: GoogleGenAI, text: string): Promise<number[]> {
  const result = await (ai.models as any).embedContent({ model: EMBED_MODEL, contents: text });
  const values: number[] =
    result?.embeddings?.[0]?.values ?? result?.embedding?.values ?? [];
  if (!values.length) throw new Error('Empty embedding returned');
  return values;
}

async function fetchCases(search: string, limit: number, offset: number): Promise<OldpResponse> {
  const params = new URLSearchParams({
    search, limit: String(limit), offset: String(offset), format: 'json',
  });
  const res = await fetch(`${OLDP_BASE}/cases/?${params}`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'LegalBuddy/1.0' },
  });
  if (!res.ok) throw new Error(`OLDP API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-ingestion-secret'] ?? req.body?.secret;
  if (INGESTION_SECRET && secret !== INGESTION_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const area   = (req.body?.area  ?? 'Vertrag Kuendigung Schadensersatz') as string;
  const count  = Math.min(Number(req.body?.count  ?? 50), 200);
  const offset = Number(req.body?.offset ?? 0);

  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  if (!GEMINI_API_KEY)   return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  let inserted = 0, skipped = 0;
  const errors: string[] = [];

  try {
    const page = await fetchCases(area, count, offset);

    for (const doc of page.results ?? []) {
      try {
        const rawContent = doc.content ?? doc.abstract ?? '';
        if (!rawContent.trim()) { skipped++; continue; }

        const content    = cleanText(rawContent);
        const courtName  = doc.court?.name ?? 'Unbekanntes Gericht';
        const legalArea  = mapLegalArea(doc.tags ?? [], courtName);
        const textToEmbed = `${doc.file_number} ${doc.type ?? 'Urteil'}\nGericht: ${courtName}\nDatum: ${doc.date}\n\n${content}`;
        const embedding  = await embedText(ai, textToEmbed);
        const docUrl     = doc.source_url ?? `https://de.openlegaldata.io/case/${doc.slug}/`;

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
      ok: true, area, fetched: page.results?.length ?? 0,
      total_available: page.count,
      inserted, skipped, errors: errors.slice(0, 10),
    });
  } catch (err) {
    console.error('[ingest-legal-docs]', err);
    return res.status(500).json({ error: String(err) });
  }
}
