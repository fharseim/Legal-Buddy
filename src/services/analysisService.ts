import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';
import { Case } from './caseService';
import { messageService } from './messageService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export interface CaseAnalysis {
  id: string;
  case_id: string;
  user_id: string;
  pass1_raw: string;
  pass2_review: string;
  final_content: string;
  confidence_score: number;
  needs_more_info: boolean;
  questions_for_user: string[];
  status: 'draft' | 'reviewed' | 'sent';
  admin_notes: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface CreateAnalysisInput {
  case_id: string;
  user_id: string;
  pass1_raw: string;
  pass2_review: string;
  final_content: string;
  confidence_score: number;
  needs_more_info: boolean;
  questions_for_user: string[];
}

const URGENCY_LABELS: Record<string, string> = {
  low: 'Niedrig', normal: 'Normal', high: 'Hoch', urgent: 'Dringend',
};

function buildPass1Prompt(c: Case): string {
  return `Du bist ein erfahrener deutscher Rechtsanwalt mit Spezialisierung auf ${c.category}.

MANDAT:
Titel: ${c.title}
Rechtsgebiet: ${c.category}
Dringlichkeit: ${URGENCY_LABELS[c.urgency] ?? c.urgency}
Beschreibung: ${c.description ?? 'Keine Beschreibung angegeben'}

Erstelle eine vollstaendige rechtliche Erstanalyse mit folgenden Pflichtabschnitten:

## 1. Sachverhaltserfassung
Fasse den Sachverhalt in juristischer Sprache zusammen.

## 2. Rechtliche Einordnung
Welche Gesetze, Paragraphen (SS) und ggf. Rechtsprechung (BGH, OLG) sind relevant? Zitiere praezise.

## 3. Rechtslage und Bewertung
Wie ist die rechtliche Situation des Mandanten? Staerken und Schwaechen des Falls.

## 4. Konkrete Handlungsempfehlungen
Schritt-fuer-Schritt was der Mandant jetzt tun sollte. Prioritisiert nach Wichtigkeit.

## 5. Wichtige Fristen
Welche Fristen (Verjaehrung, Widerruf, etc.) muessen beachtet werden? Mit konkreten Zeitangaben.

## 6. Fehlende Informationen
Welche Informationen fehlen fuer eine vollstaendige Bewertung?

## 7. Confidence Score
Wie sicher bist du bei dieser Analyse auf einer Skala von 1-10?
Antworte mit: SCORE: X (dann ein Satz Begruendung)`;
}

function buildPass2Prompt(pass1: string, c: Case): string {
  return `Du bist ein zweiter unabhaengiger Anwalt und Qualitaetspruefer.

Rechtsgebiet: ${c.category}
Titel: ${c.title}

ANALYSE DES KOLLEGEN:
${pass1}

DEINE AUFGABE - Qualitaetspruefung:

## Rechtliche Korrektheit
Sind die zitierten Paragraphen und Gesetze korrekt und vollstaendig?

## Fehlende Aspekte
Fehlen wichtige Rechtsbereiche, Fristen oder Handlungsoptionen?

## Korrekturen und Ergaenzungen
Liste konkrete Korrekturen oder Ergaenzungen auf.

## Finales Urteil
GENEHMIGT / GENEHMIGT_MIT_ANMERKUNGEN / UEBERARBEITUNG_ERFORDERLICH`;
}

function buildFinalPrompt(pass1: string, pass2: string): string {
  return `Du bist ein leitender Anwalt. Erstelle die FINALE bereinigte Analyse fuer den Mandanten.
Integriere alle Korrekturen aus der Qualitaetspruefung.

ERSTANALYSE:
${pass1}

QUALITAETSPRUEFUNG:
${pass2}

ANFORDERUNGEN:
- Klar und verstaendlich fuer Laien
- Alle Paragraphen-Zitate korrekt
- Konkrete, umsetzbare Handlungsempfehlungen
- Strukturiert mit klaren Abschnitten
- Schlusshinweis: "Dies ist eine erste Rechtsinformation, kein Ersatz fuer individuelle Anwaltsberatung."

Schreibe die finale Analyse jetzt:`;
}

function extractConfidenceScore(text: string): number {
  const m = text.match(/SCORE:\s*(\d+)/i);
  if (m) return Math.min(10, Math.max(1, parseInt(m[1])));
  return 5;
}

function extractQuestions(text: string): string[] {
  const sectionMatch = text.match(/##\s*6[^#]*([\s\S]*?)(?=##\s*7|$)/i);
  if (!sectionMatch) return [];
  const items = sectionMatch[1].match(/^[-*\d.]+\s+(.+)$/gm);
  if (!items) return [];
  return items
    .map(i => i.replace(/^[-*\d.]+\s+/, '').trim())
    .filter(i => i.length > 10)
    .slice(0, 5);
}

export const analysisService = {
  async runTwoPassAnalysis(legalCase: Case): Promise<{
    pass1: string; pass2: string; final: string;
    confidence: number; needsMoreInfo: boolean; questions: string[];
  }> {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const r1 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: buildPass1Prompt(legalCase) }] }],
    });
    const pass1 = r1.text ?? '';

    const r2 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: buildPass2Prompt(pass1, legalCase) }] }],
    });
    const pass2 = r2.text ?? '';

    const r3 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: buildFinalPrompt(pass1, pass2) }] }],
    });
    const final = r3.text ?? '';

    const confidence = extractConfidenceScore(pass1);
    const questions = extractQuestions(pass1);
    const needsMoreInfo = questions.length > 0 || confidence < 5;

    return { pass1, pass2, final, confidence, needsMoreInfo, questions };
  },

  async createAnalysis(input: CreateAnalysisInput): Promise<CaseAnalysis> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('case_analyses')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as CaseAnalysis;
  },

  async getAnalysesForAdmin(): Promise<(CaseAnalysis & { cases: { title: string; category: string; urgency: string; user_id: string } | null })[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('case_analyses')
      .select('*, cases(title, category, urgency, user_id)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as any;
  },

  async getAnalysisById(id: string): Promise<CaseAnalysis | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('case_analyses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as CaseAnalysis;
  },

  async getAnalysisByCase(caseId: string): Promise<CaseAnalysis | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('case_analyses')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data as CaseAnalysis | null;
  },

  async updateAnalysis(
    id: string,
    updates: Partial<Pick<CaseAnalysis, 'final_content' | 'admin_notes' | 'status' | 'sent_at'>>
  ): Promise<CaseAnalysis> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('case_analyses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CaseAnalysis;
  },

  async sendAnalysisToUser(analysisId: string, caseId: string, finalContent: string): Promise<void> {
    await messageService.addMessage(caseId, 'assistant', finalContent);
    await this.updateAnalysis(analysisId, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  },

  async triggerAnalysisForCase(legalCase: Case): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const result = await this.runTwoPassAnalysis(legalCase);
      await this.createAnalysis({
        case_id: legalCase.id,
        user_id: user.id,
        pass1_raw: result.pass1,
        pass2_review: result.pass2,
        final_content: result.final,
        confidence_score: result.confidence,
        needs_more_info: result.needsMoreInfo,
        questions_for_user: result.questions,
      });
    } catch (e) {
      console.error('Background analysis failed:', e);
    }
  },
};
