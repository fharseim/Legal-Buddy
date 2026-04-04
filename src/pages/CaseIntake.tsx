import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { caseService } from '../services/caseService';

const CATEGORIES = [
  { id: 'mietrecht', label: 'Mietrecht', icon: '🏠', desc: 'Kündigung, Mängel, Kaution' },
  { id: 'arbeitsrecht', label: 'Arbeitsrecht', icon: '💼', desc: 'Kündigung, Abmahnung, Lohn' },
  { id: 'vertragsrecht', label: 'Vertragsrecht', icon: '📄', desc: 'Kaufverträge, AGB, Widerruf' },
  { id: 'verbraucherrecht', label: 'Verbraucherrecht', icon: '🛒', desc: 'Gewährleistung, Reklamation' },
  { id: 'familienrecht', label: 'Familienrecht', icon: '👨‍👩‍👧', desc: 'Unterhalt, Scheidung, Sorgerecht' },
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
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });

  const canNext = () => {
    if (step === 1) return !!form.category;
    if (step === 2) return form.title.trim().length >= 5;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.category || !form.title.trim()) return;
    try {
      setSaving(true);
      setError(null);
      const created = await caseService.createCase({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        urgency: form.urgency,
      });
      navigate(`/chat/${created.id}`);
    } catch (err) {
      console.error(err);
      setError('Fall konnte nicht erstellt werden. Bitte versuche es erneut.');
      setSaving(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.id === form.category);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-blue-600 w-8' : 'bg-slate-200 w-4'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-400">Schritt {step} von 3</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Kategorie */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welches Rechtsgebiet betrifft Ihr Anliegen?</h1>
              <p className="text-slate-500 text-sm mb-8">Wählen Sie die passende Kategorie aus.</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      form.category === cat.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{cat.icon}</span>
                    <span className="font-semibold text-slate-900 text-sm block">{cat.label}</span>
                    <span className="text-xs text-slate-500">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Titel & Beschreibung */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{selectedCategory?.icon}</span>
                <span className="text-sm font-medium text-slate-500">{selectedCategory?.label}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Beschreiben Sie Ihr Anliegen</h1>
              <p className="text-slate-500 text-sm mb-8">Je mehr Details, desto besser kann die KI helfen.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kurzer Titel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="z.B. Unrechtmäßige Kündigung durch Vermieter"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    maxLength={120}
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.title.length}/120 Zeichen</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Detaillierte Beschreibung</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Was ist genau passiert? Wann? Welche Dokumente liegen vor?"
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Dringlichkeit */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Wie dringend ist Ihr Anliegen?</h1>
              <p className="text-slate-500 text-sm mb-8">Dies hilft uns, Prioritäten richtig zu setzen.</p>
              <div className="space-y-3 mb-8">
                {URGENCY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setForm(f => ({ ...f, urgency: opt.id }))}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      form.urgency === opt.id ? urgencyBorder[opt.id] : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 text-sm block">{opt.label}</span>
                    <span className="text-xs text-slate-500">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Zusammenfassung</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kategorie</span>
                    <span className="font-medium text-slate-900">{selectedCategory?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titel</span>
                    <span className="font-medium text-slate-900 truncate ml-4 max-w-xs text-right">{form.title}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Zurück
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || !canNext()}
              className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wird erstellt…
                </>
              ) : (
                'Fall erstellen & KI starten'
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
