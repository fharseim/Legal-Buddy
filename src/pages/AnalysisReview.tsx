import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, CheckCircle, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { analysisService, CaseAnalysis } from '../services/analysisService';
import { caseService, Case } from '../services/caseService';

const CONFIDENCE_COLOR = (score: number) =>
  score >= 7 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
  score >= 4 ? 'text-amber-600 bg-amber-50 border-amber-200' :
               'text-red-600 bg-red-50 border-red-200';

function CollapsibleSection({
  title, content, defaultOpen = false, badge
}: {
  title: string; content: string; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#1a1a2e] text-sm">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <pre className="px-5 py-4 text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed border-t border-gray-100 max-h-96 overflow-y-auto bg-white">
              {content}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalysisReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [legalCase, setLegalCase] = useState<Case | null>(null);
  const [finalContent, setFinalContent] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    analysisService.getAnalysisById(id).then(async a => {
      if (!a) { setLoading(false); return; }
      setAnalysis(a);
      setFinalContent(a.final_content ?? '');
      setAdminNotes(a.admin_notes ?? '');
      if (a.case_id) {
        const c = await caseService.getCase(a.case_id);
        setLegalCase(c);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSaveDraft = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const updated = await analysisService.updateAnalysis(analysis.id, {
        final_content: finalContent,
        admin_notes: adminNotes,
        status: 'reviewed',
      });
      setAnalysis(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleSendToUser = async () => {
    if (!analysis || !finalContent.trim()) return;
    setSending(true);
    try {
      // Save latest edits first
      await analysisService.updateAnalysis(analysis.id, {
        final_content: finalContent,
        admin_notes: adminNotes,
      });
      // Send to user chat
      await analysisService.sendAnalysisToUser(analysis.id, analysis.case_id, finalContent);
      setSent(true);
      setTimeout(() => navigate('/admin'), 1500);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-400 mb-4">Analyse nicht gefunden.</p>
          <button onClick={() => navigate('/admin')} className="text-blue-600 text-sm hover:underline">Zurueck</button>
        </div>
      </DashboardLayout>
    );
  }

  const alreadySent = analysis.status === 'sent';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#1a1a2e] transition-colors text-sm mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Zurueck zur Warteschlange
            </button>
            <h1 className="text-2xl font-serif text-[#1a1a2e]">
              {legalCase?.title ?? 'Fall-Analyse'}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {legalCase && (
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-widest">
                  {legalCase.category}
                </span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full border font-bold ${CONFIDENCE_COLOR(analysis.confidence_score)}`}>
                Confidence: {analysis.confidence_score}/10
              </span>
              {analysis.needs_more_info && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                  <AlertCircle className="w-3 h-3" /> Infos fehlen
                </span>
              )}
              {alreadySent && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                  <CheckCircle className="w-3 h-3" /> Bereits zugestellt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Questions for user (if any) */}
        {analysis.questions_for_user && analysis.questions_for_user.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Rueckfragen an Mandanten
            </h3>
            <ul className="space-y-1.5">
              {analysis.questions_for_user.map((q, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="font-bold mt-0.5">{i + 1}.</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Passes (collapsible) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">KI-Rohdaten</h2>
          <CollapsibleSection
            title="Pass 1 — Erstanalyse"
            content={analysis.pass1_raw}
            badge={<span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold">KI Draft</span>}
          />
          <CollapsibleSection
            title="Pass 2 — Qualitaetspruefung"
            content={analysis.pass2_review}
            badge={<span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold">Peer Review</span>}
          />
        </div>

        {/* Final content editor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-[#1a1a2e]">Finale Analyse (editierbar)</h2>
            <span className="text-xs text-gray-400 ml-auto">Wird dem Mandanten zugestellt</span>
          </div>
          <div className="p-6">
            <textarea
              value={finalContent}
              onChange={e => setFinalContent(e.target.value)}
              disabled={alreadySent}
              className="w-full h-[480px] text-sm text-gray-700 leading-relaxed resize-none outline-none font-mono bg-transparent disabled:opacity-60"
              placeholder="Finale Analyse hier bearbeiten..."
            />
          </div>
        </div>

        {/* Admin notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Interne Notizen (nicht an Mandant)
          </label>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            disabled={alreadySent}
            rows={3}
            className="w-full text-sm text-gray-700 resize-none outline-none bg-transparent disabled:opacity-60"
            placeholder="Interne Anmerkungen, Besonderheiten, Follow-up..."
          />
        </div>

        {/* Action bar */}
        {!alreadySent && (
          <div className="flex items-center justify-between gap-4 pb-8">
            <button
              onClick={handleSaveDraft}
              disabled={saving || sending}
              className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : null}
              {saved ? 'Gespeichert!' : 'Als geprueft speichern'}
            </button>

            <button
              onClick={handleSendToUser}
              disabled={sending || saving || !finalContent.trim()}
              className="px-8 py-3 bg-[#2d6a4f] hover:bg-[#245a41] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2 shadow-sm"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : sent ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sent ? 'Zugestellt!' : 'Freigeben & an Mandant senden'}
            </button>
          </div>
        )}

        {alreadySent && analysis.sent_at && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm pb-8">
            <CheckCircle className="w-4 h-4" />
            Zugestellt am {new Date(analysis.sent_at).toLocaleDateString('de-DE', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
