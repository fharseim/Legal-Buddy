import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Scale, 
  Home, 
  Briefcase, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Euro, 
  MessageSquare, 
  Upload, 
  Check, 
  Loader2,
  X,
  FileText
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { AIService } from '../services/aiService';
import { Case, Rechtsgebiet } from '../types';

export default function CaseIntake() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as Rechtsgebiet || null;
  
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    rechtsgebiet: initialType || '' as Rechtsgebiet,
    subkategorie: '',
    datum: '',
    betrag: '',
    vorkorrespondenz: '',
    sachverhalt: '',
    files: [] as File[]
  });

  const { addCase, user } = useAppContext();
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    try {
      const analysis = await AIService.analyzeCase(formData);
      
      const newCase: Case = {
        id: `LB-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        userId: user?.id || '1',
        titel: formData.sachverhalt.slice(0, 30) + '...',
        rechtsgebiet: formData.rechtsgebiet as Rechtsgebiet,
        subkategorie: formData.subkategorie,
        status: 'ai_analyse_abgeschlossen',
        sachverhalt: {
          freitext: formData.sachverhalt,
          datum: formData.datum,
          betrag: Number(formData.betrag),
          gegner: ''
        },
        dokumente: formData.files.map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          type: f.type,
          uploadDate: new Date().toISOString(),
          url: '#'
        })),
        aiAnalyse: analysis,
        generatedDocuments: [],
        fristen: analysis.rechtlicheEinordnung.fristen.map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          deadline: f.deadline,
          type: f.type as any,
          status: 'aktiv'
        })),
        timeline: [{
          timestamp: new Date().toISOString(),
          action: 'Fall erstellt',
          actor: 'user',
          details: 'Der Fall wurde erfolgreich aufgenommen und analysiert.'
        }],
        escalatedToLawyer: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addCase(newCase);
      navigate(`/case/${newCase.id}`);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-gray-100 border-t-[#2d6a4f] rounded-full mb-10"
          />
          <h2 className="text-3xl font-serif text-[#1a1a2e] mb-6">AI-Analyse läuft...</h2>
          <div className="space-y-4 w-full">
            {[
              { label: "Sachverhalt wird analysiert...", done: true },
              { label: "Relevante Gesetze werden geprüft...", done: true },
              { label: "Rechtslage wird eingeschätzt...", done: false },
              { label: "Handlungsoptionen werden erstellt...", done: false }
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                {s.done ? (
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="text-[#2d6a4f] w-4 h-4" />
                  </div>
                ) : (
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                )}
                <span className={cn("text-sm font-bold", s.done ? "text-[#1a1a2e]" : "text-gray-400")}>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-gray-500 text-sm italic">"Wusstest du? Unsere AI wurde an über 50.000 Gerichtsurteilen trainiert."</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={handleBack} disabled={step === 1} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-0 transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn(
                "h-1.5 w-12 rounded-full transition-all",
                step >= s ? "bg-[#2d6a4f]" : "bg-gray-100"
              )} />
            ))}
          </div>
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Worum geht es?</h1>
                <p className="text-gray-500">Wähle das passende Rechtsgebiet für dein Anliegen.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: 'verbraucherrecht', icon: ShoppingBag, title: 'Verbraucherrecht', desc: 'Kauf, Abo, Online-Bestellung' },
                  { id: 'vertragscheck', icon: Scale, title: 'Vertragscheck', desc: 'Vertrag prüfen lassen' },
                  { id: 'mietrecht', icon: Home, title: 'Mietrecht', desc: 'Miete, Vermieter, Wohnung', comingSoon: true },
                  { id: 'arbeitsrecht', icon: Briefcase, title: 'Arbeitsrecht', desc: 'Arbeitgeber, Kündigung', comingSoon: true },
                  { id: 'sonstiges', icon: HelpCircle, title: 'Ich bin mir nicht sicher', desc: 'Wir helfen bei der Einordnung' }
                ].map(item => (
                  <button 
                    key={item.id}
                    disabled={item.comingSoon}
                    onClick={() => {
                      setFormData({...formData, rechtsgebiet: item.id as any});
                      handleNext();
                    }}
                    className={cn(
                      "p-8 rounded-[32px] border text-left transition-all group relative",
                      item.comingSoon ? "bg-gray-50 border-gray-100 opacity-60 grayscale" : "bg-white border-gray-100 hover:border-[#2d6a4f] hover:shadow-xl"
                    )}
                  >
                    {item.comingSoon && (
                      <span className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Coming Soon</span>
                    )}
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors">
                      <item.icon className="w-6 h-6 text-gray-400 group-hover:text-[#2d6a4f]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Details zum Vorfall</h1>
                <p className="text-gray-500">Ein paar Eckdaten helfen uns bei der Analyse.</p>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Wann ist es passiert?</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="date" 
                        value={formData.datum}
                        onChange={(e) => setFormData({...formData, datum: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Streitwert (ca. in €)</label>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="number" 
                        value={formData.betrag}
                        onChange={(e) => setFormData({...formData, betrag: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Bisheriger Kontakt zum Gegner?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Keiner', 'E-Mail', 'Telefon', 'Post'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData({...formData, vorkorrespondenz: opt})}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold transition-all",
                          formData.vorkorrespondenz === opt ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  disabled={!formData.datum}
                  className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  Weiter
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Was ist genau passiert?</h1>
                <p className="text-gray-500">Schildere den Sachverhalt so detailliert wie möglich.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Deine Schilderung</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea 
                      value={formData.sachverhalt}
                      onChange={(e) => setFormData({...formData, sachverhalt: e.target.value})}
                      rows={8}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none resize-none"
                      placeholder="Erzähl uns, was passiert ist. Je mehr Details, desto besser können wir helfen..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Dokumente hochladen (optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-[24px] p-10 text-center hover:border-[#2d6a4f] transition-colors cursor-pointer group bg-white">
                    <input type="file" multiple className="hidden" id="file-upload" onChange={(e) => {
                      if (e.target.files) setFormData({...formData, files: [...formData.files, ...Array.from(e.target.files)]});
                    }} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#2d6a4f]" />
                      </div>
                      <p className="text-sm font-bold text-[#1a1a2e] mb-1">Klick zum Hochladen oder Drag & Drop</p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG (max. 10MB)</p>
                    </label>
                  </div>
                  {formData.files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-bold text-[#1a1a2e]">
                          <FileText className="w-3 h-3 text-gray-400" />
                          {f.name}
                          <button onClick={() => setFormData({...formData, files: formData.files.filter((_, idx) => idx !== i)})} className="text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleNext}
                  disabled={formData.sachverhalt.length < 20}
                  className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  Zusammenfassung prüfen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Stimmt alles?</h1>
                <p className="text-gray-500">Überprüfe deine Angaben vor der Analyse.</p>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rechtsgebiet</p>
                    <p className="font-bold text-[#1a1a2e] capitalize">{formData.rechtsgebiet}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Datum</p>
                    <p className="font-bold text-[#1a1a2e]">{formData.datum}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Streitwert</p>
                    <p className="font-bold text-[#1a1a2e]">{formData.betrag || '0'} €</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vorkorrespondenz</p>
                    <p className="font-bold text-[#1a1a2e]">{formData.vorkorrespondenz || 'Keine'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Schilderung</p>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{formData.sachverhalt}"</p>
                </div>

                {formData.files.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hochgeladene Dokumente</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.files.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500">{f.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleSubmit}
                  className="w-full bg-[#2d6a4f] text-white py-5 rounded-full font-bold hover:bg-[#1b4332] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-2 group"
                >
                  Analyse starten
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-4 text-gray-500 font-bold hover:text-[#1a1a2e] transition-all"
                >
                  Bearbeiten
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
