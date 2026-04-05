/**
 * legalSearchService – client-side RAG search for German legal documents
 *
 * 1. Embeds a query text using Google gemini-embedding-001 (768 dims via v1beta)
 * 2. Calls Supabase RPC search_legal_documents (pgvector cosine similarity)
 * 3. Returns top-k relevant court decisions and law paragraphs
 */

import { supabase } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const EMBED_MODEL    = 'gemini-embedding-001';
const EMBED_DIMS     = 768;

export interface LegalDocument {
  id: string;
  doc_type: 'court_decision' | 'law' | 'statute';
  source: string;
  title: string;
  content: string;
  court: string | null;
  decision_date: string | null;
  file_number: string | null;
  legal_area: string | null;
  url: string | null;
  similarity: number;
}

/**
 * Embed a text string using gemini-embedding-001 via v1beta REST API.
 * Returns a 768-dimensional float array.
 */
async function embedText(text: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIMS,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`[legalSearchService] Embed API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const values: number[] = data?.embedding?.values ?? [];
  if (!values.length) {
    throw new Error('[legalSearchService] embedContent returned empty vector');
  }
  return values;
}

/**
 * Search the legal_documents table for documents similar to queryText.
 */
export async function searchLegalDocuments(
  queryText: string,
  options: {
    matchCount?: number;
    matchThreshold?: number;
    filterArea?: string;
    filterDocType?: 'court_decision' | 'law' | 'statute';
  } = {}
): Promise<LegalDocument[]> {
  if (!supabase) return [];
  if (!GEMINI_API_KEY) {
    console.warn('[legalSearchService] VITE_GEMINI_API_KEY not set – skipping RAG');
    return [];
  }

  const {
    matchCount     = 8,
    matchThreshold = 0.5,   // lowered from 0.63 – corpus similarity scores are ~0.55–0.65
    filterArea,
    filterDocType,
  } = options;

  try {
    const embedding = await embedText(queryText);

    const { data, error } = await supabase.rpc('search_legal_documents', {
      query_embedding:  embedding,
      match_threshold:  matchThreshold,
      match_count:      matchCount,
      filter_area:      filterArea ?? null,
      filter_doc_type:  filterDocType ?? null,
    });

    if (error) {
      console.error('[legalSearchService] RPC error:', error.message);
      return [];
    }

    return (data ?? []) as LegalDocument[];
  } catch (err) {
    console.error('[legalSearchService] Search failed:', err);
    return [];
  }
}

/**
 * Format search results as a RAG context block for injection into a Gemini prompt.
 */
export function formatRagContext(docs: LegalDocument[]): string {
  if (!docs.length) return '';

  const sections = docs.map((doc, i) => {
    const parts: string[] = [];
    parts.push(`### [${i + 1}] ${doc.title}`);
    if (doc.court)         parts.push(`Gericht: ${doc.court}`);
    if (doc.decision_date) parts.push(`Datum: ${doc.decision_date}`);
    if (doc.file_number)   parts.push(`Aktenzeichen: ${doc.file_number}`);
    if (doc.legal_area)    parts.push(`Rechtsgebiet: ${doc.legal_area}`);
    if (doc.url)           parts.push(`Quelle: ${doc.url}`);
    parts.push('');
    parts.push(doc.content.slice(0, 600));
    if (doc.content.length > 600) parts.push('...');
    return parts.join('\n');
  });

  return [
    '## RELEVANTE RECHTSPRECHUNG UND GESETZE (RAG-Kontext)',
    '',
    'Die folgenden Quellen wurden automatisch aus einer Datenbank mit deutschen',
    'Gerichtsentscheidungen abgerufen und sind inhaltlich relevant fuer diesen Fall.',
    'Nutze sie als Grundlage fuer praezise Zitate und Rechtsprechungshinweise.',
    '',
    ...sections,
    '',
    '---',
    '',
  ].join('\n');
}

/**
 * Convenience: get RAG context string ready for prompt injection.
 * Returns empty string on error (graceful degradation).
 */
export async function getRagContextForCase(
  caseDescription: string,
  legalArea?: string
): Promise<string> {
  try {
    const docs = await searchLegalDocuments(caseDescription, {
      matchCount:     8,
      matchThreshold: 0.5,
      filterArea:     legalArea,
    });
    console.log(`[legalSearchService] RAG found ${docs.length} docs (threshold=0.5)`);
    return formatRagContext(docs);
  } catch {
    return '';
  }
}
