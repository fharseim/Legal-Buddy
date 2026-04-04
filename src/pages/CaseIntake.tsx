import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, AlertTriangle, CheckCircle, Loader2, Scale } from 'lucide-react';
import { caseService } from '../services/caseService';
import { analysisService } from '../services/analysisService';
import { creditService, type UserCredits } from '../services/creditService';
import { useAppContext } from '../context/AppContext';
import IntakeWizard, {
  type Answers,
  generateCaseDescription,
  generateCaseTitle,
} from '../components/IntakeWizard';

const CATEGORIES = [
  { id: 'mietrecht', label: 'Mietrecht', icon: '🏠', desc: 'Kündigung, Mängel, Kaution' },
  { id: 'arbeitsrecht', label: 'Arbeitsrecht', icon: '💼', desc: 'Kündigung, Abmahnung, Lohn' },
  { id: 'vertragsrecht', label: 'Vertragsrecht', icon: '📄', desc: 'Kaufverträge, AGB, Widerruf' },
  { id: 'verbraucherrecht', label: 'Verbraucherrecht', icon: '🛒', desc: 'Gewährleistung, Reklamation' },
  { id: 'familienrecht', label: 'Familienrecht', icon: '👪', desc: 'Unterhalt, Scheidung, Sorgerecht' },
  { id: 'verkehrsrecht', label: 'Verkehrsrecht', icon: '🚗', desc: 'Unfall, Bußgeld, Führerschein' },
  { id: 'erbrecht', label: 'Erbrecht', icon: '📜', desc: 'Testament, Erbfolge, Pflichtteil' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '⚖️', desc: 'Anderes Rechtsgebiet' },
];

const URGENCY_OPTIONS = [
  { id: 'low', label: 'Niedrig', desc: 'Keine zeitliche Dringlichkeit', color: 'slate' },
  { id: 'normal', label: 'Normal', desc: 'Innerhalb weniger Wochen', color: 'blue' },
  { id: 'high', label: 'Hoch', desc: 'Innerhalb weniger Tage', color: 'amber' },
  { id: 'urgent', label: 'Dringend', desc: 'Sofortiger Handlungsbedarf', color: 'red' },
] as const;

const urgencyBorder: Record<string, string> = {
  low: 'border-slate-300 bg-slate-50',
  normal: 'border-blue-400 bg-blue-50',
  high: 'border-amber-400 bg-amber-50',
  urgent: 'border-red-400 bg-red-50',
};

export default function CaseIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [wizardAnswers, setWizardAnswers] = useState<Answers>({});
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  const paymentCancelled = searchParams.get('payment') === 'cancelled';

  useEffect(() => {
    creditService.getCredits().then(c => {
      setCredits(c);
      setCreditsLoading(false);
    });
  }, []);

  const creditsRemaining = credits?.credits_remaining ?? 0;
  const hasCredits = creditsRemaining > 0;
  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const caseTitle = selectedCategory ? generateCaseTitle(selectedCategory, wizardAnswers) : '';
  const caseDescription = selectedCategory ? generateCaseDescription(selectedCategory, wizardAnswers) : '';

  const handleWizardComplete = (answers: Answers) => {
    setWizardAnswers(answers);
    setStep(3);
  };

  const handleBuyCredit = async () => {
    if (!user) return;
    try {
      setCheckingOut(true);
      setError(null);
      const url = await creditService.createCheckoutSession(user.id, user.email);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError('Zahlung konnte nicht initiiert werden. Bitte versuche es erneut.');
      setCheckingOut(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !caseTitle) return;
    try {
      setSaving(true);
      setError(null);
      const ok = await creditService.decrementCredit();
      if (!ok) {
        setError('Keine Credits vorhanden. Bitte kaufe zuerst eine Analyse.');
        setSaving(false);
        return;
      }
      const created = await caseService.createCase({ title: caseTitle, category: selectedCategory, description: caseDescription, urgency });
      analysisService.triggerAnalysisForCase(created).catch(e => console.error('Background analysis error:', e));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Fall konnte nicht erstellt werden. Bitte versuche es erneut.');
      setSaving(false);
    }
  };

  const stepCount = 3;
  const stepLabel = step === 1 ? 'Rechtsgebiet' : step === 2 ? 'Ihr Anliegen' : 'Zusammenfassung';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => { if (step === 1) navigate('/dashboard'); else if (step === 2) setStep(1); else setStep(2); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Zurück
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: stepCount }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-blue-600 w-8' : 'bg-slate-200 w-4'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-400 text-right">{stepLabel}</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col">
        {paymentCancelled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">Zahlung abgebrochen. Dein Fall wurde nicht erstellt.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welches Rechtsgebiet betrifft Ihr Anliegen?</h1>
              <p className="text-slate-500 text-sm mb-8">Wählen Sie die passende Kategorie — danach stellen wir Ihnen gezielte Fragen.</p>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setWizardAnswers({}); setStep(2); }} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all group">
                    <span className="text-2xl block mb-2">{cat.icon}</span>
                    <span className="font-semibold text-slate-900 text-sm block group-hover:text-blue-700 transition-colors">{cat.label}</span>
                    <span className="text-xs text-slate-500">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">{selectedCategoryData?.icon}</span>
                <span className="text-sm font-semibold text-slate-500">{selectedCategoryData?.label}</span>
              </div>
              <IntakeWizard category={selectedCategory} onComplete={handleWizardComplete} onBack={() => setStep(1)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Fast geschafft!</h1>
              <p className="text-slate-500 text-sm mb-8">Überprüfen Sie die Zusammenfassung und wählen Sie die Dringlichkeit.</p>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{selectedCategoryData?.icon}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedCategoryData?.label}</h3>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-3">{caseTitle}</p>
                {caseDescription && (
                  <div className="text-xs text-slate-500 space-y-1 border-t border-slate-50 pt-3">
                    {caseDescription.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                )}
                <button onClick={() => setStep(2)} className="mt-3 text-xs text-blue-600 hover:underline font-medium">Angaben bearbeiten →</button>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Wie dringend ist Ihr Anliegen?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCY_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setUrgency(opt.id)} className={`p-3 rounded-xl border-2 text-left transition-all ${urgency === opt.id ? urgencyBorder[opt.id] : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      <span className="font-semibold text-slate-900 text-xs block">{opt.label}</span>
                      <span className="text-xs text-slate-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!creditsLoading && (
                <>
                  {hasCredits ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700"><strong>{creditsRemaining} {creditsRemaining === 1 ? 'Credit' : 'Credits'}</strong> verfügbar — wird für diesen Fall verwendet.</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 mb-4 text-white">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-5 h-5 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">Analyse kaufen</h4>
                          <p className="text-sm text-slate-300 mb-3 leading-relaxed">KI-Analyse + anwaltliche Prüfung · Ergebnis in 24 h</p>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold">9,90 €</span>
                            <button onClick={handleBuyCredit} disabled={checkingOut} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm disabled:opacity-60">
                              {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                              Jetzt bezahlen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 flex gap-3 mb-6">
                <Scale className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">Ihre Angaben werden von unserer KI analysiert und anschließend von einem Rechtsexperten geprüft. Sie erhalten eine fundierte Einschätzung direkt in Ihrer Fallakte.</p>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

              <button onClick={handleSubmit} disabled={saving || !hasCredits} className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
                {saving ? (<><Loader2 className="w-4 h-4 animate-spin" />Wird erstellt…</>) : ('Fall einreichen und KI-Analyse starten')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
