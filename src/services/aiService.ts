import { AIAnalysis, GeneratedDocument, Rechtsgebiet } from '../types';

export const AIService = {
  analyzeCase: async (intakeData: any): Promise<AIAnalysis> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      zusammenfassung: "Basierend auf deiner Schilderung liegt ein klassischer Fall von Gewährleistung im Online-Handel vor. Da das Produkt mangelhaft ist und du den Händler bereits informiert hast, stehen deine Chancen auf Nacherfüllung oder Rücktritt sehr gut.",
      rechtlicheEinordnung: {
        anwendbaresRecht: ["§ 434 BGB (Sachmangel)", "§ 437 BGB (Rechte des Käufers)", "§ 439 BGB (Nacherfüllung)"],
        rechte: ["Nacherfüllung (Reparatur oder Neulieferung)", "Rücktritt vom Vertrag", "Schadensersatz"],
        fristen: [
          { name: "Gewährleistungsfrist", deadline: "2028-03-15", type: "gesetzlich" },
          { name: "Widerrufsfrist", deadline: "2026-04-29", type: "gesetzlich" }
        ],
        beweislage: "Gut – Kaufbeleg und Fotos des Defekts sind vorhanden.",
        erfolgsaussichten: "Hoch"
      },
      confidenceScore: 0.85,
      handlungsoptionen: [
        { 
          titel: "Fristsetzung zur Nacherfüllung", 
          beschreibung: "Wir erstellen ein rechtssicheres Schreiben, in dem du dem Händler eine 14-tägige Frist zur Behebung des Mangels setzt.",
          empfohlen: true, 
          automatisierbar: true 
        },
        { 
          titel: "Rücktritt vom Kaufvertrag", 
          beschreibung: "Sollte die Frist verstreichen, kannst du vom Vertrag zurücktreten und dein Geld zurückfordern.",
          empfohlen: false, 
          automatisierbar: true 
        },
        { 
          titel: "Anwaltliche Beratung", 
          beschreibung: "Falls der Händler sich weigert, vermitteln wir dich an einen Partner-Anwalt.",
          empfohlen: false, 
          automatisierbar: false 
        }
      ],
      disclaimer: "Diese Ersteinschätzung wurde AI-gestützt erstellt und wird anwaltlich verantwortet. Sie dient der ersten Orientierung."
    };
  },

  generateDocument: async (type: string, caseData: any): Promise<GeneratedDocument> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      titel: "Fristsetzung zur Nacherfüllung",
      inhalt: `Sehr geehrte Damen und Herren,\n\nam [DATUM] habe ich bei Ihnen [PRODUKT] bestellt. Leider weist das Produkt folgenden Mangel auf: [MANGEL].\n\nHiermit fordere ich Sie auf, den Mangel im Wege der Nacherfüllung gemäß § 439 BGB bis zum [FRIST] zu beheben.\n\nMit freundlichen Grüßen,\n[NAME]`,
      klartextVersion: "Dieses Schreiben fordert den Händler offiziell auf, das kaputte Gerät zu reparieren oder zu ersetzen. Wir setzen dafür eine Frist von 14 Tagen.",
      reviewStatus: "ai_generated",
      createdAt: new Date().toISOString()
    };
  },

  classifyRechtsgebiet: async (freitext: string): Promise<{ erkanntes_rechtsgebiet: Rechtsgebiet; confidence: number }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      erkanntes_rechtsgebiet: "verbraucherrecht",
      confidence: 0.92
    };
  }
};
