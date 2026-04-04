import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { caseService, Case } from '../services/caseService';

const statusLabel: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  resolved: 'Gelöst',
  closed: 'Abgeschlossen',
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
  low: 'Niedrig',
  normal: 'Normal',
  high: 'Hoch',
  urgent: 'Dringend',
};

export default function Dashboard() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getCases();
      setCases(data);
    } catch (err) {
      console.error(err);
      setError('Fälle konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleDelete = async (id: string) => {
    if (!confirm('Fall wirklich löschen?')) return;
    try {
      setDeletingId(id);
      await caseService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Löschen fehlgeschlagen.');
    } finally {
      setDeletingId(null);
    }
  };

  const openCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress').length;

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
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
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
              Guten Tag{user?.user_metadata?.name ? ', ' + user.user_metadata.name.split(' ')[0] : ''} 👋
            </h1>
            <p className="text-slate-500">
              {cases.length === 0
                ? 'Noch keine Fälle – starten Sie jetzt Ihre erste Anfrage.'
                : `${openCases} aktive ${openCases === 1 ? 'Fall' : 'Fälle'} von insgesamt ${cases.length}`}
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Gesamt', value: cases.length },
            { label: 'Offen', value: cases.filter(c => c.status === 'open').length },
            { label: 'In Bearbeitung', value: cases.filter(c => c.status === 'in_progress').length },
            { label: 'Gelöst', value: cases.filter(c => c.status === 'resolved' || c.status === 'closed').length },
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
            <button onClick={loadCases} className="text-blue-600 text-sm font-medium hover:underline">
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Keine Fälle vorhanden</h3>
            <p className="text-slate-500 text-sm mb-6">Stellen Sie Ihre erste Rechtsfrage – kostenlos und unkompliziert.</p>
            <button
              onClick={() => navigate('/case-intake')}
              className="bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Ersten Fall erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c, i) => (
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
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor[c.urgency]}`}>
                        {urgencyLabel[c.urgency]}
                      </span>
                      <span className="text-xs text-slate-400">{c.category}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate mb-1">{c.title}</h3>
                    {c.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(c.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/chat/${c.id}`)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Öffnen
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="text-xs font-medium text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === c.id ? '...' : 'Löschen'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
