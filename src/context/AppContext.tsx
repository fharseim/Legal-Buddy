import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Case } from '../types';

interface AppContextType {
  user: User | null;
  cases: Case[];
  setUser: (user: User | null) => void;
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('legal_buddy_user');
    const storedCases = localStorage.getItem('legal_buddy_cases');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Default demo user
      setUser({
        id: '1',
        email: 'sarah.mueller@beispiel.de',
        name: 'Sarah Müller',
        plan: 'pro',
        planStart: new Date().toISOString(),
        planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageThisMonth: 2,
        createdAt: new Date().toISOString()
      });
    }

    if (storedCases) {
      setCases(JSON.parse(storedCases));
    } else {
      // Default demo cases
      const demoCase: Case = {
        id: 'LB-2026-00142',
        userId: '1',
        titel: 'Mangelhafter Staubsauger - Online-Kauf',
        rechtsgebiet: 'verbraucherrecht',
        status: 'ai_analyse_abgeschlossen',
        sachverhalt: {
          freitext: 'Ich habe am 15.03. online einen Staubsauger bestellt. Nach 3 Tagen kam er an, aber der Motor funktioniert nicht. Ich habe den Händler kontaktiert, aber keine Antwort erhalten.',
          datum: '2026-03-15',
          betrag: 249.99,
          gegner: 'CleanHome GmbH'
        },
        dokumente: [
          { id: 'd1', name: 'Rechnung.pdf', type: 'application/pdf', uploadDate: '2026-03-18T10:00:00Z', url: '#' },
          { id: 'd2', name: 'Foto_Defekt.jpg', type: 'image/jpeg', uploadDate: '2026-03-18T10:05:00Z', url: '#' }
        ],
        aiAnalyse: {
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
            }
          ],
          disclaimer: "Diese Ersteinschätzung wurde AI-gestützt erstellt und wird anwaltlich verantwortet. Sie dient der ersten Orientierung."
        },
        generatedDocuments: [
          {
            id: 'g1',
            type: 'fristsetzung',
            titel: 'Fristsetzung zur Nacherfüllung',
            inhalt: 'Sehr geehrte Damen und Herren,\n\nam 15.03.2026 habe ich bei Ihnen den Staubsauger "CleanMax 3000" bestellt. Leider weist das Produkt einen Defekt am Motor auf...\n\nHiermit fordere ich Sie auf...',
            klartextVersion: 'Dieses Schreiben fordert den Händler offiziell auf, das kaputte Gerät zu reparieren oder zu ersetzen.',
            reviewStatus: 'ai_generated',
            createdAt: '2026-03-20T14:30:00Z'
          }
        ],
        fristen: [
          { id: 'f1', name: 'Gewährleistungsfrist', deadline: '2028-03-15', type: 'gesetzlich', status: 'aktiv' },
          { id: 'f2', name: 'Widerrufsfrist', deadline: '2026-04-29', type: 'gesetzlich', status: 'aktiv' }
        ],
        timeline: [
          { timestamp: '2026-03-18T10:00:00Z', action: 'Fall erstellt', actor: 'user', details: 'Fall wurde mit Dokumenten hochgeladen.' },
          { timestamp: '2026-03-18T10:02:00Z', action: 'AI-Analyse abgeschlossen', actor: 'ai', details: 'Ersteinschätzung wurde generiert.' },
          { timestamp: '2026-03-20T14:30:00Z', action: 'Dokument generiert', actor: 'ai', details: 'Fristsetzung zur Nacherfüllung wurde erstellt.' }
        ],
        escalatedToLawyer: false,
        createdAt: '2026-03-18T10:00:00Z',
        updatedAt: '2026-03-20T14:30:00Z'
      };
      setCases([demoCase]);
    }
    
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('legal_buddy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('legal_buddy_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('legal_buddy_cases', JSON.stringify(cases));
  }, [cases]);

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  return (
    <AppContext.Provider value={{ user, cases, setUser, addCase, updateCase, isAuthReady }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
