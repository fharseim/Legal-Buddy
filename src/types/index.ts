export type Rechtsgebiet = 'verbraucherrecht' | 'vertragscheck' | 'mietrecht' | 'arbeitsrecht' | 'sonstiges';

export type CaseStatus = 'eingegangen' | 'in_bearbeitung' | 'ai_analyse_abgeschlossen' | 'anwaltlich_geprueft' | 'erledigt' | 'archiviert';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  plan: 'buddy' | 'pro' | 'familie';
  planStart: string;
  planEnd: string;
  usageThisMonth: number;
  createdAt: string;
}

export interface Case {
  id: string;
  userId: string;
  titel: string;
  rechtsgebiet: Rechtsgebiet;
  subkategorie?: string;
  status: CaseStatus;
  sachverhalt: {
    freitext: string;
    datum?: string;
    betrag?: number;
    gegner?: string;
  };
  dokumente: CaseDocument[];
  aiAnalyse?: AIAnalysis;
  generatedDocuments: GeneratedDocument[];
  fristen: Deadline[];
  timeline: TimelineEvent[];
  notes?: string;
  escalatedToLawyer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

export interface AIAnalysis {
  zusammenfassung: string;
  rechtlicheEinordnung: {
    anwendbaresRecht: string[];
    rechte: string[];
    fristen: { name: string; deadline: string; type: string }[];
    beweislage: string;
    erfolgsaussichten: 'Hoch' | 'Mittel' | 'Gering';
  };
  confidenceScore: number;
  handlungsoptionen: {
    titel: string;
    beschreibung: string;
    empfohlen: boolean;
    automatisierbar: boolean;
  }[];
  disclaimer: string;
}

export interface GeneratedDocument {
  id: string;
  type: string;
  titel: string;
  inhalt: string;
  klartextVersion: string;
  reviewStatus: 'ai_generated' | 'anwaltlich_geprueft';
  createdAt: string;
}

export interface Deadline {
  id: string;
  name: string;
  deadline: string;
  type: 'gesetzlich' | 'vertraglich' | 'selbst_gesetzt';
  status: 'aktiv' | 'erledigt' | 'abgelaufen';
}

export interface TimelineEvent {
  timestamp: string;
  action: string;
  actor: 'user' | 'ai' | 'anwalt';
  details: string;
}
