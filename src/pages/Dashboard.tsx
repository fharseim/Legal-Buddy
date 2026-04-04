import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { caseService, Case } from '../services/caseService';
import { analysisService, CaseAnalysis } from '../services/analysisService';

const statusLabel: Record<string, string> = {
  open: 'Offen', in_progress: 'In Bearbeitung', resolved: 'Geloest', closed: 'Abgeschlossen',
};
const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed: 'bg-slate-50 text-slate-600 border-slate-200',
};
const urgencyColor: Record<string, string> = {
  low: 'bg-slate-100 text-slate-500',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};
const urgencyLabel: Record<string, string> = {
  low: 'Niedrig', normal: 'Normal', high: 'Hoch', urgent: 'Dringend',
};

function AnalysisBadge({ analysis }: { analysis: CaseAnalysis | undefined }) {
  if (!analysis) return null;

  if (analysis.status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Einschaetzung erhalten
      </span>
    );
  }

  if (analysis.status === 'reviewed' && analysis.needs_more_info) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        Rueckfragen ausstehend
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Analyse in Pruefung
    </span>
  );
}

export default function Dashboard() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [analyses, setAnalyses] = useState<CaseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [casesData, analysesData] = await Promise.all([
        caseService.getCases(),
        analysisService.getAnalysesForUser(),
      ]);
      setCases(casesData);
      setAnalyses(analysesData);
    } catch (err) {
      console.error(err);
      setError('Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getAnalysisForCase = (caseId: string) =>
    analyses.find(a => a.case_id === caseId);

  const handleDelete = async (id: string) => {
    if (!confirm('Fall wirklich loeschen?')) return;
    try {
      setDeletingId(id);
      await caseService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Loeschen fehlgeschlagen.');
    } finally {
      setDeletingId(null);
    }
  };

  const openCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const pendingAnalyses = analyses.filter(a => a.status === 'draft').length;
  const sentAnalyses = analyses.filter(a => a.status === 'sent').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Legal Buddy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.email}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Guten Tag{user?.user_metadata?.name ? ', ' + user.user_metadata.name.split(' ')[0] : ''} \u{1F44B}
            </h1>
            <p className="text-slate-500">
              {cases.length === 0
                ? 'Noch keine Faelle – starten Sie jetzt Ihre erste Anfrage.'
                : openCases + ' aktive ' + (openCases === 1 ? 'Fall' : 'Faelle') + ' von insgesamt ' + cases.length}
            </p>
          </div>
          <button
            onClick={() => navigate('/case-intake')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neuer Fall
          </button>
        </div>

        {/* Notification banner: pending analyses */}
        {!loading && pendingAnalyses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {pendingAnalyses === 1 ? 'Eine Analyse' : pendingAnalyses + ' Analysen'} in Bearbeitung
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Unser Rechtsexperte prueft Ihren Fall. Sie erhalten Ihre Einschaetzung in Kuerze.
              </p>
            </div>
          </motion.div>
        )}

        {/* Notification banner: sent analyses */}
        {!loading && sentAnalyses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {sentAnalyses === 1 ? 'Eine Einschaetzung' : sentAnalyses + ' Einschaetzungen'} bereit
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Oeffnen Sie den jeweiligen Fall, um Ihre rechtliche Einschaetzung zu lesen.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Gesamt', value: cases.length },
            { label: 'Offen', value: cases.filter(c => c.status === 'open').length },
            { label: 'In Bearbeitung', value: cases.filter(c => c.status === 'in_progress').length },
            { label: 'Geloest', value: cases.filter(c => c.status === 'resolved' || c.status === 'closed').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Cases list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">{error}</p>
            <button onClick={loadData} className="text-blue-600 text-sm font-medium hover:underline">
              Erneut versuchen
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Keine Faelle vorhanden</h3>
            <p className="text-slate-500 text-sm mb-6">Stellen Sie Ihre erste Rechtsfrage - kostenlos und unkompliziert.</p>
            <button
              onClick={() => navigate('/case-intake')}
              className="bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Ersten Fall erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c, i) => {
              const analysis = getAnalysisForCase(c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className={'text-xs font-medium px-2.5 py-1 rounded-full border ' + statusColor[c.status]}>
                          {statusLabel[c.status]}
                        </span>
                        <span className={'text-xs font-medium px-2.5 py-1 rounded-full ' + urgencyColor[c.urgency]}>
                          {urgencyLabel[c.urgency]}
                        </span>
                        <span className="text-xs text-slate-400">{c.category}</span>
                        <AnalysisBadge analysis={analysis} />
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate mb-1">{c.title}</h3>
                      {c.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(c.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate('/chat/' + c.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Oeffnen
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-xs font-medium text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        {deletingId === c.id ? '...' : 'Loeschen'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
