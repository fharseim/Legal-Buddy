import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Scale, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Mail, 
  ChevronRight, 
  Shield, 
  ArrowRight,
  MessageSquare,
  History,
  Printer,
  Share2,
  MoreVertical,
  X,
  Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AIService } from '../services/aiService';

export default function CaseDetail() {
  const { id } = useParams();
  const { cases, updateCase } = useAppContext();
  const navigate = useNavigate();
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const currentCase = cases.find(c => c.id === id);

  if (!currentCase) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Fall nicht gefunden</h2>
          <Link to="/dashboard" className="text-[#2d6a4f] font-bold hover:underline">Zurück zum Dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleGenerateDoc = async (type: string) => {
    setIsGeneratingDoc(true);
    try {
      const doc = await AIService.generateDocument(type, currentCase);
      const updatedCase = {
        ...currentCase,
        generatedDocuments: [...currentCase.generatedDocuments, doc],
        timeline: [
          ...currentCase.timeline,
          {
            timestamp: new Date().toISOString(),
            action: 'Dokument generiert',
            actor: 'ai' as const,
            details: `Das Dokument "${doc.titel}" wurde erfolgreich erstellt.`
          }
        ],
        updatedAt: new Date().toISOString()
      };
      updateCase(updatedCase);
      setSelectedDoc(doc);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-500" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[#1a1a2e]">{currentCase.titel}</h1>
                <span className="px-3 py-1 bg-green-50 text-[#2d6a4f] rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                  {currentCase.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500">Fall ID: {currentCase.id} • Erstellt am {format(new Date(currentCase.createdAt), 'dd. MMMM yyyy', { locale: de })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><Share2 className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><Printer className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* AI Summary */}
            <section className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-[#1a1a2e] p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2d6a4f] rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">AI-Ersteinschätzung</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentCase.aiAnalyse?.confidenceScore || 0) * 100}%` }}
                          className="h-full bg-[#2d6a4f]"
                        />
                      </div>
                      <span className="text-sm font-bold">{(currentCase.aiAnalyse?.confidenceScore || 0) * 100}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-lg font-serif leading-relaxed text-gray-200">
                  {currentCase.aiAnalyse?.zusammenfassung}
                </p>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Rechtliche Einordnung</h3>
                  <ul className="space-y-3">
                    {currentCase.aiAnalyse?.rechtlicheEinordnung.rechte.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#1a1a2e]">
                        <CheckCircle2 className="w-5 h-5 text-[#2d6a4f] flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Anwendbare Gesetze</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentCase.aiAnalyse?.rechtlicheEinordnung.anwendbaresRecht.map((g, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-100">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Action Options */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#1a1a2e]">Deine nächsten Schritte</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {currentCase.aiAnalyse?.handlungsoptionen.map((opt, i) => (
                  <div key={i} className={cn(
                    "p-8 rounded-[32px] border transition-all flex flex-col",
                    opt.empfohlen ? "bg-white border-[#2d6a4f] shadow-xl shadow-green-900/5 ring-1 ring-[#2d6a4f]" : "bg-white border-gray-100"
                  )}>
                    {opt.empfohlen && (
                      <span className="bg-[#2d6a4f] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest self-start mb-6">Empfohlen</span>
                    )}
                    <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{opt.titel}</h3>
                    <p className="text-sm text-gray-500 mb-8 flex-grow">{opt.beschreibung}</p>
                    <button 
                      onClick={() => opt.automatisierbar ? handleGenerateDoc(opt.titel) : null}
                      className={cn(
                        "w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 group",
                        opt.empfohlen ? "bg-[#2d6a4f] text-white hover:bg-[#1b4332]" : "bg-[#1a1a2e] text-white hover:bg-black"
                      )}
                    >
                      {isGeneratingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          {opt.automatisierbar ? 'Dokument erstellen' : 'Anwalt anfragen'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a1a2e]">Generierte Dokumente</h2>
              </div>
              <div className="space-y-4">
                {currentCase.generatedDocuments.length > 0 ? (
                  currentCase.generatedDocuments.map(doc => (
                    <div key={doc.id} className="p-6 bg-white rounded-[24px] border border-gray-100 flex items-center justify-between group hover:border-[#2d6a4f] transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#2d6a4f] transition-colors">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a1a2e]">{doc.titel}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(doc.createdAt), 'dd.MM.yyyy', { locale: de })}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-widest">{doc.reviewStatus.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedDoc(doc)}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-[#1a1a2e] hover:bg-gray-50 transition-all"
                        >
                          Vorschau
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#2d6a4f] transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all">
                          <Mail className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-400">Noch keine Dokumente generiert.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Deadlines */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#1a1a2e]">Fristen</h2>
              <div className="space-y-3">
                {currentCase.fristen.map(f => (
                  <div key={f.id} className="p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className={cn(
                      "absolute top-0 left-0 w-1 h-full",
                      f.status === 'erledigt' ? "bg-green-500" : "bg-orange-500"
                    )} />
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.type}</span>
                      {f.status === 'erledigt' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <h4 className="font-bold text-[#1a1a2e] mb-1">{f.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(f.deadline), 'dd. MMMM yyyy', { locale: de })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Case Info */}
            <section className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a2e]">Fall-Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sachverhalt</p>
                  <p className="text-sm text-gray-600 line-clamp-3 italic">"{currentCase.sachverhalt.freitext}"</p>
                  <button className="text-[10px] font-bold text-[#2d6a4f] mt-1 hover:underline">Mehr anzeigen</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Streitwert</p>
                    <p className="text-sm font-bold text-[#1a1a2e]">{currentCase.sachverhalt.betrag} €</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Datum</p>
                    <p className="text-sm font-bold text-[#1a1a2e]">{currentCase.sachverhalt.datum}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Dokumente</p>
                <div className="space-y-2">
                  {currentCase.dokumente.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-xs p-2 hover:bg-gray-50 rounded-lg transition-all">
                      <span className="truncate max-w-[150px] font-medium text-[#1a1a2e]">{d.name}</span>
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#1a1a2e]">Verlauf</h2>
              <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                {currentCase.timeline.map((event, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={cn(
                      "absolute left-2 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10",
                      event.actor === 'ai' ? "bg-[#2d6a4f]" : "bg-[#1a1a2e]"
                    )} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {format(new Date(event.timestamp), 'dd. MMM, HH:mm', { locale: de })}
                    </p>
                    <h4 className="text-sm font-bold text-[#1a1a2e] mb-1">{event.action}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{event.details}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoc(null)}
              className="absolute inset-0 bg-[#1a1a2e]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#fafaf8]">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a2e]">{selectedDoc.titel}</h3>
                  <p className="text-sm text-gray-500">Vorschau des generierten Dokuments</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-10 grid lg:grid-cols-2 gap-10">
                {/* Document Content */}
                <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-lg font-serif text-[#1a1a2e] whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.inhalt}
                </div>
                
                {/* Plain Language Explanation */}
                <div className="space-y-8">
                  <div className="bg-green-50 p-8 rounded-[32px] border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#2d6a4f] rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1a1a2e]">Was bedeutet das?</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{selectedDoc.klartextVersion}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nächste Schritte</h4>
                    <div className="space-y-3">
                      {[
                        "Dokument als PDF herunterladen",
                        "Per E-Mail an den Händler senden",
                        "Anwalt zur finalen Prüfung anfragen"
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#1a1a2e] shadow-sm">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-[#1a1a2e]">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-[#fafaf8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#2d6a4f]" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI-Generiert & Anwaltlich verantwortet</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-8 py-4 rounded-full font-bold text-[#1a1a2e] hover:bg-gray-200 transition-all">
                    Bearbeiten
                  </button>
                  <button className="bg-[#2d6a4f] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1b4332] transition-all shadow-xl shadow-green-900/10 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    PDF Herunterladen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
