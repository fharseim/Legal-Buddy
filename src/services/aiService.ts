import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, GeneratedDocument, Rechtsgebiet } from '../types';

// API Key wird von Vite zur Build-Zeit injiziert (siehe vite.config.ts)
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('[AIService] GEMINI_API_KEY ist nicht gesetzt. AI-Funktionen werden nicht funktionieren.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY ?? '' });
const MODEL = 'gemini-2.0-flash';

// ─────────────────────────────────────────────
// 1) FALLANALYSE
// ─────────────────────────────────────────────
export const AIService = {

  analyzeCase: async (intakeData: {
    rechtsgebiet: string;
    subkategorie?: string;
    sachverhalt: {
      freitext: string;
      datum?: string;
      betrag?: number;
      gegner?: string;
    };
  }): Promise<AIAnalysis> => {

    const today = new Date().toISOString().split('T')[0];

    const prompt = `
Du bist ein erfahrener deutscher Rechtsanwalt und analysierst den folgenden Rechtsfall für einen Verbraucher in Deutschland.
Das heutige Datum ist: ${today}

FALL-INFORMATIONEN:
- Rechtsgebiet: ${intakeData.rechtsgebiet}
- Subkategorie: ${intakeData.subkategorie ?? 'nicht angegeben'}
- Sachverhalt: ${intakeData.sachverhalt.freitext}
- Relevantes Datum: ${intakeData.sachverhalt.datum ?? 'nicht angegeben'}
- Streitwert: ${intakeData.sachverhalt.betrag ? `${intakeData.sachverhalt.betrag} EUR` : 'nicht angegeben'}
- Gegner/Vertragspartner: ${intakeData.sachverhalt.gegner ?? 'nicht angegeben'}

Erstelle eine strukturierte rechtliche Ersteinschätzung auf Basis des deutschen Rechts. Gib deine Antwort als valides JSON zurück, das exakt folgendem Schema entspricht:

{
  "zusammenfassung": "Kurze, verständliche Zusammenfassung des Falls für den Mandanten (2-3 Sätze, keine Juristensprache)",
  "rechtlicheEinordnung": {
    "anwendbaresRecht": ["§ XYZ BGB (Bezeichnung)", "..."],
    "rechte": ["Recht 1", "Recht 2", "..."],
    "fristen": [
      { "name": "Fristname", "deadline": "YYYY-MM-DD", "type": "gesetzlich|vertraglich|selbst_gesetzt" }
    ],
    "beweislage": "Kurze Einschätzung der Beweissituation",
    "erfolgsaussichten": "Hoch|Mittel|Gering"
  },
  "confidenceScore": 0.0,
  "handlungsoptionen": [
    {
      "titel": "Kurzname der Option",
      "beschreibung": "Verständliche Beschreibung was diese Option bedeutet und was damit erreicht werden kann",
      "empfohlen": true,
      "automatisierbar": true
    }
  ],
  "disclaimer": "Diese Ersteinschätzung wurde KI-gestützt erstellt und ersetzt keine individuelle anwaltliche Beratung. Sie dient der ersten Orientierung."
}

Wichtige Hinweise:
- confidenceScore: Zahl zwischen 0.0 und 1.0 (wie sicher bist du dir bei dieser Einschätzung?)
- Fristen-Datum: Als ISO-Datum ab heute (${today}) berechnen
- Mindestens 2, maximal 4 Handlungsoptionen
- Die empfohlene Option soll realistisch und für Verbraucher umsetzbar sein
- Nur echte deutsche Rechtsnormen zitieren
- Antwort NUR als JSON, kein Markdown drumherum
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const raw = response.text ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AIAnalysis;
    return parsed;
  },

  // ─────────────────────────────────────────────
  // 2) DOKUMENT GENERIEREN
  // ─────────────────────────────────────────────
  generateDocument: async (
    type: string,
    caseData: {
      titel: string;
      rechtsgebiet: string;
      sachverhalt: {
        freitext: string;
        datum?: string;
        betrag?: number;
        gegner?: string;
      };
      userName?: string;
    }
  ): Promise<GeneratedDocument> => {

    const today = new Date().toISOString().split('T')[0];
    const deadline14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const documentTypes: Record<string, string> = {
      fristsetzung: 'Fristsetzung zur Nacherfüllung',
      abmahnung: 'Abmahnung',
      ruecktritt: 'Rücktritserklärung vom Vertrag',
      widerruf: 'Widerrufserklärung',
      kuendigung: 'Kündigung',
      mahnschreiben: 'Mahnschreiben',
      beschwerde: 'Beschwerdeschreiben',
    };

    const docTitle = documentTypes[type] ?? type;

    const prompt = `
Du bist ein erfahrener deutscher Rechtsanwalt und erstellst ein rechtssicheres Schreiben für einen Verbraucher.

AUFTRAG: Erstelle ein "${docTitle}" auf Basis folgender Fallinformationen:
- Fall: ${caseData.titel}
- Rechtsgebiet: ${caseData.rechtsgebiet}
- Sachverhalt: ${caseData.sachverhalt.freitext}
- Datum des Vorfalls: ${caseData.sachverhalt.datum ?? 'nicht angegeben'}
- Streitwert: ${caseData.sachverhalt.betrag ? `${caseData.sachverhalt.betrag} EUR` : 'nicht angegeben'}
- Gegner: ${caseData.sachverhalt.gegner ?? '[GEGNER]'}
- Absender: ${caseData.userName ?? '[IHR NAME]'}
- Heutiges Datum: ${today}
- Frist (14 Tage): ${deadline14Days}

Gib deine Antwort als valides JSON zurück:

{
  "titel": "${docTitle}",
  "inhalt": "Das vollständige, rechtssichere Schreiben als Fließtext mit \\n für Zeilenumbrüche.",
  "klartextVersion": "Eine kurze (2-3 Sätze), verständliche Erklärung was dieses Schreiben bewirkt."
}

Anforderungen:
- Formeller Briefstil auf Deutsch
- Korrekte Rechtsgrundlagen nennen (§§ BGB etc.)
- Klare Forderung formulieren
- Antwort NUR als JSON
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });

    const raw = response.text ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as { titel: string; inhalt: string; klartextVersion: string };

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      titel: parsed.titel,
      inhalt: parsed.inhalt,
      klartextVersion: parsed.klartextVersion,
      reviewStatus: 'ai_generated',
      createdAt: new Date().toISOString(),
    };
  },

  // ─────────────────────────────────────────────
  // 3) RECHTSGEBIET KLASSIFIZIEREN
  // ─────────────────────────────────────────────
  classifyRechtsgebiet: async (
    freitext: string
  ): Promise<{ erkanntes_rechtsgebiet: Rechtsgebiet; confidence: number }> => {

    const validGebiete: Rechtsgebiet[] = [
      'verbraucherrecht',
      'vertragscheck',
      'mietrecht',
      'arbeitsrecht',
      'sonstiges',
    ];

    const prompt = `
Du bist ein Rechtsexperte. Klassifiziere den folgenden Text in GENAU eines dieser deutschen Rechtsgebiete:
- verbraucherrecht (Kauf, Gewährleistung, Widerruf, Online-Shopping)
- vertragscheck (Vertragsprüfung, AGB, Kündigung von Verträgen)
- mietrecht (Wohnung, Miete, Vermieter, Kaution)
- arbeitsrecht (Job, Kündigung, Lohn, Arbeitgeber)
- sonstiges (alles andere)

TEXT: "${freitext}"

Antworte NUR mit diesem JSON:
{
  "erkanntes_rechtsgebiet": "eines der 5 Gebiete oben",
  "confidence": 0.0
}
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.1 },
    });

    const raw = response.text ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as { erkanntes_rechtsgebiet: string; confidence: number };

    const gebiet = validGebiete.includes(parsed.erkanntes_rechtsgebiet as Rechtsgebiet)
      ? (parsed.erkanntes_rechtsgebiet as Rechtsgebiet)
      : 'sonstiges';

    return {
      erkanntes_rechtsgebiet: gebiet,
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
    };
  },
};
