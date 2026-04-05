/**
 * POST /api/ingest-legal-docs
 *
 * Fetches German court decisions from OpenJur, embeds them with
 * Google text-embedding-004, and stores them in Supabase pgvector.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const SUPABASE_URL     = process.env.SUPABASE_URL      ?? process.env.VITE_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY    ?? process.env.VITE_GEMINI_API_KEY ?? '';
const INGESTION_SECRET = process.env.INGESTION_SECRET  ?? '';

const OPENJUR_BASE = 'https://api.openjur.de';
const EMBED_MODEL  = 'text-embedding-004';
const MAX_CONTENT  = 1800;

interface OpenJurResult {
  id: number;
  titel: string;
  gericht: string;
  datum: string;
  aktenzeichen: string;
  rechtsgebiete?: string[];
  kurztext?: string;
  langtext?: string;
  permalink?: string;
}

interface OpenJurResponse {
  ergebnisse: OpenJurResult[];
  gesamtAnzahl: number;
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

function mapLegalArea(gebiete?: string[]): string {
  if (!gebiete?.length) return 'Allgemeines Recht';
  const g = gebiete[0].toLowerCase();
  if (g.includes('miet'))         return 'Mietrecht';
  if (g.includes('arbeit'))       return 'Arbeitsrecht';
  if (g.includes('verbraucher'))  return 'Verbraucherrecht';
  if (g.includes('vertrags'))     return 'Vertragsrecht';
  if (g.includes('familien'))     return 'Familienrecht';
  if (g.includes('erb'))          return 'Erbrecht';
  if (g.includes('handels'))      return 'Handelsrecht';
  if (g.includes('straf'))        return 'Strafrecht';
  if (g.includes('verwaltung'))   return 'Verwaltungsrecht';
  if (g.includes('steuer'))       return 'Steuerrecht';
  if (g.includes('gesellschaft')) return 'Gesellschaftsrecht';
  return gebiete[0];
}

async function embedText(ai: GoogleGenAI, text: string): Promise<number[]> {
  const result = await (ai.models as any).embedContent({ model: EMBED_MODEL, contents: text });
  const values: number[] =
    result?.embeddings?.[0]?.values ?? result?.embedding?.values ?? [];
  if (!values.length) throw new Error('Empty embedding returned');
  return values;
}

async function fetchOpenJurPage(query: string, start: number, count: number): Promise<OpenJurResponse> {
  const params = new URLSearchParams({ q: query, start: String(start), anzahl: String(count), format: 'json' });
  const res = await fetch(`${OPENJUR_BASE}/urteile?${params}`);
  if (!res.ok) throw new Error(`OpenJur API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-ingestion-secret'] ?? req.body?.secret;
  if (INGESTION_SECRET && secret !== INGESTION_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const area   = (req.body?.area  ?? '')  as string;
  const count  = Math.min(Number(req.body?.count  ?? 50), 200);
  const offset = Number(req.body?.offset ?? 0);

  if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  if (!GEMINI_API_KEY)   return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const searchQuery = area
    ? `Rechtsgebiet:${area} Urteil`
    : 'Urteil Schadensersatz Vertrag Kuendigung Mietrecht Arbeitsrecht';

  let inserted = 0, skipped = 0;
  const errors: string[] = [];

  try {
    const page = await fetchOpenJurPage(searchQuery, offset, count);

    for (const doc of page.ergebnisse ?? []) {
      try {
        const rawContent = doc.langtext ?? doc.kurztext ?? '';
        if (!rawContent.trim()) { skipped++; continue; }

        const content   = cleanText(rawContent);
        const legalArea = mapLegalArea(doc.rechtsgebiete);
        const textToEmbed = `${doc.titel}\nGericht: ${doc.gericht}\nRechtsgebiet: ${legalArea}\n\n${content}`;
        const embedding = await embedText(ai, textToEmbed);

        const { error } = await sb.from('legal_documents').upsert({
          doc_type: 'court_decision', source: 'openjur',
          title: doc.titel, content, court: doc.gericht,
          decision_date: doc.datum || null, file_number: doc.aktenzeichen || null,
          legal_area: legalArea,
          url: doc.permalink ?? `${OPENJUR_BASE}/urteile/${doc.id}`,
          embedding: `[${embedding.join(',')}]`,
        }, { onConflict: 'url' });

        if (error) errors.push(`Doc ${doc.id}: ${error.message}`);
        else inserted++;

        await new Promise(r => setTimeout(r, 120));
      } catch (docErr) {
        errors.push(`Doc ${doc.id}: ${String(docErr)}`);
        skipped++;
      }
    }

    return res.status(200).json({
      ok: true, area: area || 'all',
      fetched: page.ergebnisse?.length ?? 0,
      inserted, skipped, errors: errors.slice(0, 10),
    });
  } catch (err) {
    console.error('[ingest-legal-docs]', err);
    return res.status(500).json({ error: String(err) });
  }
}
