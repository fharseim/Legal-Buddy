import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';
import { Case } from './caseService';
import { messageService } from './messageService';
import { getRagContextForCase } from './legalSearchService';

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

// ─────────────────────────────────────────────────────────────────────────────
// RAG-enhanced prompt builders
// ─────────────────────────────────────────────────────────────────────────────

function buildPass1Prompt(c: Case, ragContext: string): string {
  return (
    'Du bist ein erfahrener deutscher Rechtsanwalt mit Spezialisierung auf ' + c.category + '.\n\n'
    + (ragContext
      ? ragContext + '\n\nNUTZE DIE OBEN GENANNTE RECHTSPRECHUNG als konkrete Belege fuer deine Analyse.\n\n'
      : '')
    + 'MANDAT:\n'
    + 'Titel: ' + c.title + '\n'
    + 'Rechtsgebiet: ' + c.category + '\n'
    + 'Dringlichkeit: ' + (URGENCY_LABELS[c.urgency] ?? c.urgency) + '\n'
    + 'Beschreibung: ' + (c.description ?? 'Keine Beschreibung angegeben') + '\n\n'
    + 'Erstelle eine vollstaendige rechtliche Erstanalyse mit folgenden Pflichtabschnitten:\n\n'
    + '## 1. Sachverhaltserfassung\n'
    + 'Fasse den Sachverhalt in juristischer Sprache zusammen.\n\n'
    + '## 2. Rechtliche Einordnung\n'
    + 'Welche Gesetze, Paragraphen und ggf. Rechtsprechung (BGH, OLG) sind relevant? '
    + 'Zitiere praezise.\n\n'
    + '## 3. Rechtslage und Bewertung\n'
    + 'Wie ist die rechtliche Situation des Mandanten? Staerken und Schwaechen des Falls.\n\n'
    + '## 4. Konkrete Handlungsempfehlungen\n'
    + 'Schritt-fuer-Schritt was der Mandant jetzt tun sollte.\n\n'
    + '## 5. Wichtige Fristen\n'
    + 'Welche Fristen muessen beachtet werden? Mit konkreten Zeitangaben.\n\n'
    + '## 6. Fehlende Informationen\n'
    + 'Welche Informationen fehlen fuer eine vollstaendige Bewertung?\n\n'
    + '## 7. Confidence Score\n'
    + 'Wie sicher bist du bei dieser Analyse auf einer Skala von 1-10?\n'
    + 'Antworte mit: SCORE: X (dann ein Satz Begruendung)'
  );
}

function buildPass2Prompt(pass1: string, c: Case): string {
  return (
    'Du bist ein zweiter unabhaengiger Anwalt und Qualitaetspruefer.\n\n'
    + 'Rechtsgebiet: ' + c.category + '\n'
    + 'Titel: ' + c.title + '\n\n'
    + 'ANALYSE DES KOLLEGEN:\n' + pass1 + '\n\n'
    + 'DEINE AUFGABE - Qualitaetspruefung:\n\n'
    + '## Rechtliche Korrektheit\n'
    + 'Sind die zitierten Paragraphen und Gesetze korrekt und vollstaendig?\n\n'
    + '## Fehlende Aspekte\n'
    + 'Fehlen wichtige Rechtsbereiche, Fristen oder Handlungsoptionen?\n\n'
    + '## Korrekturen und Ergaenzungen\n'
    + 'Liste konkrete Korrekturen oder Ergaenzungen auf.\n\n'
    + '## Finales Urteil\n'
    + 'GENEHMIGT / GENEHMIGT_MIT_ANMERKUNGEN / UEBERARBEITUNG_ERFORDERLICH'
  );
}

function buildFinalPrompt(pass1: string, pass2: string): string {
  return (
    'Du bist ein vertrauenswuerdiger Rechtsberater, der komplexe juristische Sachverhalte in klare, '
    + 'alltagsverstaendliche Sprache uebersetzt. Dein Ziel: Der Nutzer soll nach dem Lesen genau wissen, '
    + 'wie seine Situation zu bewerten ist und was er als naechstes tun muss – ohne Vorkenntnisse.\n\n'
    + 'INTERNE ERSTANALYSE (nicht direkt kopieren, als Grundlage verwenden):\n' + pass1 + '\n\n'
    + 'QUALITAETSPRUEFUNG (Korrekturen integrieren):\n' + pass2 + '\n\n'
    + 'STRENGE ANFORDERUNGEN AN DEN OUTPUT:\n\n'
    + '1. SPRACHE: Kein Juristendeutsch. Schreibe wie ein erfahrener Freund, der zufaellig Anwalt ist. '
    + 'Gesetzesparagraphen kurz erwaehnen (z.B. "§ 558 BGB"), aber IMMER sofort in einem Satz erklaeren, '
    + 'was das konkret bedeutet. Gerichtsentscheidungen nur nennen wenn direkt hilfreich – '
    + 'dann in einfachen Worten erklaeren, was das Gericht entschieden hat.\n\n'
    + '2. STRUKTUR – genau diese fuenf Abschnitte in dieser Reihenfolge, keine anderen:\n\n'
    + '## Ihre Situation kurz erklaert\n'
    + 'Zwei bis drei Saetze in einfachem Deutsch: Was ist passiert und wie steht der Nutzer da? '
    + 'Kein Fachjargon, keine Paragraphen – nur der Kern.\n\n'
    + '## Was das rechtlich bedeutet\n'
    + 'Erklaere die relevanten Gesetze und Rechte des Nutzers in verstaendlichen Saetzen. '
    + 'Nenne Paragraphen nur mit direkter Erklaerung dahinter. '
    + 'Wenn Gerichte aehnliche Faelle entschieden haben, schreibe z.B.: '
    + '"Gerichte haben in solchen Faellen haeufig geurteilt, dass..." – klar und konkret.\n\n'
    + '## Was Sie jetzt tun sollten\n'
    + 'Eine nummerierte Liste mit 3-6 konkreten Schritten. Jeder Schritt muss sofort umsetzbar sein: '
    + 'Wer macht was, bis wann, auf welchem Weg (Brief, E-Mail, Anruf)? '
    + 'Der erste Schritt ist immer der dringendste. Schritt fuer Schritt, keine langen Absaetze.\n\n'
    + '## Fristen und Deadlines\n'
    + 'Nur die wirklich wichtigen Fristen – mit konkreten Zeitangaben oder Hinweis, '
    + 'dass keine gesetzliche Frist existiert. Falls keine Fristen relevant sind, kurz bestaetigen.\n\n'
    + '## Ihr Musterschreiben an die Gegenseite\n'
    + 'Erstelle einen vollstaendigen, versandfertigen Brief, den der Nutzer direkt an die Gegenseite '
    + '(Vermieter, Arbeitgeber, Behoerde etc.) senden kann. Der Brief muss:\n'
    + '- Mit [Platzhalter] fuer persoenliche Daten arbeiten (z.B. [Ihr Name], [Adresse], [Datum])\n'
    + '- Die konkrete Forderung oder das Anliegen klar benennen\n'
    + '- Das rechtliche Fundament eingebettet haben: relevante Paragraphen DIREKT im Brieftext nennen '
    + '(z.B. "gemaess § 558 BGB bin ich berechtigt..."), sodass die Gegenseite die Ernsthaftigkeit '
    + 'erkennt und der Brief rechtlich belastbar ist\n'
    + '- Eine klare Frist setzen, bis wann die Gegenseite reagieren soll (typisch: 14 Tage)\n'
    + '- Foermlich aber klar formuliert sein (Anrede "Sehr geehrte/r...", Abschluss "Mit freundlichen Gruessen")\n'
    + 'Der Brief ist das Herzstuck – der Nutzer soll ihn nur noch mit seinen Daten ausfuellen und absenden.\n\n'
    + '3. VERBOTEN: Kein Abschnitt "Sachverhaltserfassung", kein "Confidence Score", '
    + 'keine "Fehlenden Informationen" als eigener Abschnitt. '
    + 'Keine formellen Anreden am Anfang des Gesamttextes.\n\n'
    + '4. Am Ende, nach dem Musterschreiben, eine einzelne kursive Zeile:\n'
    + '_Hinweis: Diese Einschaetzung ist eine erste rechtliche Information und ersetzt keine individuelle Anwaltsberatung._\n\n'
    + 'Schreibe jetzt den finalen Text:'
  );
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

// ─────────────────────────────────────────────────────────────────────────────
// analysisService
// ─────────────────────────────────────────────────────────────────────────────

export const analysisService = {
  async runTwoPassAnalysis(legalCase: Case): Promise<{
    pass1: string; pass2: string; final: string;
    confidence: number; needsMoreInfo: boolean; questions: string[];
    ragDocsUsed: number;
  }> {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    let ragContext = '';
    let ragDocsUsed = 0;
    try {
      const queryText = `${legalCase.title} ${legalCase.description ?? ''} ${legalCase.category}`;
      ragContext = await getRagContextForCase(queryText, legalCase.category);
      ragDocsUsed = (ragContext.match(/### \[/g) ?? []).length;
      console.log(`[analysisService] RAG: ${ragDocsUsed} docs retrieved`);
    } catch (ragErr) {
      console.warn('[analysisService] RAG fetch failed (continuing without):', ragErr);
    }

    const r1 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: buildPass1Prompt(legalCase, ragContext) }] }],
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

    const confidence    = extractConfidenceScore(pass1);
    const questions     = extractQuestions(pass1);
    const needsMoreInfo = questions.length > 0 || confidence < 5;

    return { pass1, pass2, final, confidence, needsMoreInfo, questions, ragDocsUsed };
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

  async getAnalysesForUser(): Promise<CaseAnalysis[]> {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('case_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as CaseAnalysis[];
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

  async sendQuestionsToUser(analysisId: string, caseId: string, questions: string[]): Promise<void> {
    const lines = [
      '## Rueckfragen zu Ihrem Fall',
      '',
      'Unser Rechtsexperte benoetigt noch einige Informationen, um Ihren Fall vollstaendig einschaetzen zu koennen:',
      '',
      ...questions.map((q, i) => (i + 1) + '. ' + q),
      '',
      'Bitte beantworten Sie diese Fragen so ausfuehrlich wie moeglich.',
    ];
    await messageService.addMessage(caseId, 'assistant', lines.join('\n'));
    await this.updateAnalysis(analysisId, { status: 'reviewed' });
  },

  async triggerAnalysisForCase(legalCase: Case): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const result = await this.runTwoPassAnalysis(legalCase);
      console.log(`[analysisService] Analysis complete. RAG docs used: ${result.ragDocsUsed}`);
      const saved = await this.createAnalysis({
        case_id:            legalCase.id,
        user_id:            user.id,
        pass1_raw:          result.pass1,
        pass2_review:       result.pass2,
        final_content:      result.final,
        confidence_score:   result.confidence,
        needs_more_info:    result.needsMoreInfo,
        questions_for_user: result.questions,
      });
      if (result.needsMoreInfo && result.questions.length > 0) {
        await this.sendQuestionsToUser(saved.id, legalCase.id, result.questions);
      }
      await this.sendAnalysisToUser(saved.id, legalCase.id, result.final);
    } catch (e) {
      console.error('Background analysis failed:', e);
    }
  },
};
