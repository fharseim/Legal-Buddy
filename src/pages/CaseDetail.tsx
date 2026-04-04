import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { caseService, Case } from '../services/caseService';
import { messageService, Message } from '../services/messageService';
import { analysisService, CaseAnalysis } from '../services/analysisService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  resolved: 'Geloest',
  closed: 'Abgeschlossen',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
};

const URGENCY_LABELS: Record<string, string> = {
  low: 'Niedrig', normal: 'Normal', high: 'Hoch', urgent: 'Dringend',
};

function buildSystemPrompt(legalCase: Case): string {
  return `Du bist Legal Buddy, ein KI-Rechtsassistent spezialisiert auf deutsches Recht fuer Privatpersonen und Verbraucher.

FALL-KONTEXT:
- Rechtsgebiet: ${legalCase.category}
- Titel: ${legalCase.title}
- Beschreibung: ${legalCase.description ?? 'Keine detaillierte Beschreibung'}
- Dringlichkeit: ${URGENCY_LABELS[legalCase.urgency]}

Du beantwortest Rueckfragen des Mandanten zu seinem Fall.
Beziehe dich auf die bereits erstellte Analyse und gib ergaenzende Informationen.
Stil: Klar, empatisch, verstaendlich. Immer mit dem Hinweis: "Dies ist keine Rechtsberatung."`;
}

function formatMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-slate-900 text-base mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-slate-900 text-lg mt-3 mb-1">{line.slice(2)}</h2>;
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-800 mt-2">{line.slice(2, -2)}</p>;
    if (line.startsWith('- ') || line.startsWith('\u2022 ')) return <li key={i} className="ml-4 text-slate-700 list-disc">{line.slice(2)}</li>;
    if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 text-slate-700 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-slate-700 leading-relaxed">{line}</p>;
  });
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [legalCase, setLegalCase] = useState<Case | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [c, msgs, anal] = await Promise.all([
        caseService.getCase(id),
        messageService.getMessages(id),
        analysisService.getAnalysisByCase(id),
      ]);
      setLegalCase(c);
      setMessages(msgs);
      setAnalysis(anal);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const sendMessage = async () => {
    if (!input.trim() || sending || !legalCase || !id) return;
    const userText = input.trim();
    setInput('');
    setSending(true);

    const tempUserMsg: Message = {
      id: 'temp-user',
      case_id: id,
      user_id: 'me',
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const savedUser = await messageService.addMessage(id, 'user', userText);
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const history = [...messages, savedUser].map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: { systemInstruction: buildSystemPrompt(legalCase) },
      });
      const aiText = result.text ?? 'Entschuldigung, ich konnte keine Antwort generieren.';
      const savedAI = await messageService.addMessage(id, 'assistant', aiText);
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), savedUser, savedAI]);
      if (legalCase.status === 'open') {
        await caseService.updateCase(id, { status: 'in_progress' });
        setLegalCase(prev => prev ? { ...prev, status: 'in_progress' } : prev);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'));
      setInput(userText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!legalCase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Fall nicht gefunden.</p>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 text-sm hover:underline">Zurueck zum Dashboard</button>
        </div>
      </div>
    );
  }

  const hasSentAnalysis = analysis?.status === 'sent';
  const analysisPending = !analysis || analysis.status === 'draft' || analysis.status === 'reviewed';

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-900 text-sm truncate">{legalCase.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[legalCase.status]}`}>
                {STATUS_LABELS[legalCase.status]}
              </span>
              <span className="text-xs text-slate-400">{legalCase.category}</span>
            </div>
          </div>
          <button onClick={() => setShowSidebar(s => !s)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-5xl w-full mx-auto">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

            {/* Analysis pending state */}
            {analysisPending && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Analyse wird vorbereitet</h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  Unsere KI prueft Ihren Fall mit einem mehrstufigen Qualitaetssystem.
                  Ein Rechtsexperte prueft die Analyse anschliessend und sendet Ihnen das Ergebnis zu.
                </p>
                <div className="flex gap-1.5 mt-6">
                  {[0, 0.2, 0.4].map(delay => (
                    <motion.div
                      key={delay}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.8, delay, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white text-sm' : 'bg-white border border-slate-100 text-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    )}
                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-2.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 0.2, 0.4].map(delay => (
                      <motion.div key={delay} className="w-2 h-2 bg-slate-300 rounded-full"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input — only show if analysis has been sent or user already has messages */}
          {(hasSentAnalysis || messages.length > 0) && (
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rueckfrage stellen… (Enter zum Senden)"
                  rows={1}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none disabled:opacity-50"
                  style={{ minHeight: '48px', maxHeight: '140px' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 140) + 'px';
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Legal Buddy gibt allgemeine Rechtsinformationen — keine Rechtsberatung
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden"
            >
              <div className="p-5 w-[280px]">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Fall-Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Kategorie</p>
                    <p className="font-medium text-slate-900">{legalCase.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[legalCase.status]}`}>
                      {STATUS_LABELS[legalCase.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Analyse</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      !analysis ? 'bg-slate-100 text-slate-500' :
                      analysis.status === 'sent' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {!analysis ? 'Noch nicht gestartet' :
                       analysis.status === 'sent' ? 'Zugestellt' :
                       analysis.status === 'reviewed' ? 'Geprueft — wartet auf Versand' :
                       'In Pruefung'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Dringlichkeit</p>
                    <p className="font-medium text-slate-900">{URGENCY_LABELS[legalCase.urgency]}</p>
                  </div>
                  {legalCase.description && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Beschreibung</p>
                      <p className="text-slate-700 text-xs leading-relaxed">{legalCase.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Erstellt am</p>
                    <p className="text-slate-700 text-xs">
                      {new Date(legalCase.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
