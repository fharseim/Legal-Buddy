import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const EMBED_MODEL    = 'text-embedding-004';

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

async function embedText(text: string): Promise<number[]> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (ai.models as any).embedContent({ model: EMBED_MODEL, contents: text });
  const values: number[] =
    result?.embeddings?.[0]?.values ?? result?.embedding?.values ?? [];
  if (!values.length) throw new Error('[legalSearchService] embedContent returned empty vector');
  return values;
}

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

  const { matchCount = 8, matchThreshold = 0.65, filterArea, filterDocType } = options;

  try {
    const embedding = await embedText(queryText);
    const { data, error } = await supabase.rpc('search_legal_documents', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count:     matchCount,
      filter_area:     filterArea ?? null,
      filter_doc_type: filterDocType ?? null,
    });
    if (error) { console.error('[legalSearchService] RPC error:', error.message); return []; }
    return (data ?? []) as LegalDocument[];
  } catch (err) {
    console.error('[legalSearchService] Search failed:', err);
    return [];
  }
}

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
    'Gerichtsentscheidungen abgerufen. Nutze sie als Grundlage fuer praezise Zitate.',
    '',
    ...sections,
    '',
    '---',
    '',
  ].join('\n');
}

export async function getRagContextForCase(
  caseDescription: string,
  legalArea?: string
): Promise<string> {
  try {
    const docs = await searchLegalDocuments(caseDescription, {
      matchCount: 8, matchThreshold: 0.63, filterArea: legalArea,
    });
    return formatRagContext(docs);
  } catch {
    return '';
  }
}
