import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, CheckCircle, AlertTriangle, BarChart3, ChevronRight, Clock, Search } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { analysisService, CaseAnalysis } from '../services/analysisService';

type AnalysisWithCase = CaseAnalysis & {
  cases: { title: string; category: string; urgency: string; user_id: string } | null;
};

const STATUS_CONFIG = {
  draft: { label: 'KI-Analyse bereit', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  reviewed: { label: 'Geprueft', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  sent: { label: 'Zugestellt', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Niedrig', color: 'text-slate-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  high: { label: 'Hoch', color: 'text-amber-600' },
  urgent: { label: 'Dringend', color: 'text-red-600' },
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 7 ? 'text-emerald-600' : score >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}/10
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    analysisService.getAnalysesForAdmin()
      .then(data => setAnalyses(data as AnalysisWithCase[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = analyses.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.cases?.title?.toLowerCase().includes(q) ||
      a.cases?.category?.toLowerCase().includes(q) ||
      a.status.includes(q)
    );
  });

  const pending = analyses.filter(a => a.status === 'draft').length;
  const reviewed = analyses.filter(a => a.status === 'reviewed').length;
  const sent = analyses.filter(a => a.status === 'sent').length;
  const avgConfidence = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.confidence_score, 0) / analyses.length * 10)
    : 0;

  const stats = [
    { label: 'Gesamt Faelle', value: analyses.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Warten auf Review', value: pending, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Zugestellt', value: sent, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Durchschn. Confidence', value: avgConfidence + '%', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section>
          <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Lawyer Dashboard</h1>
          <p className="text-gray-500">KI-Analysen pruefen, freigeben und an Mandanten senden.</p>
        </section>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Queue */}
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Analyse-Warteschlange</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Suchen..."
                className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-gray-200 transition-all w-52"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">
                {search ? 'Keine Ergebnisse fuer diese Suche.' : 'Noch keine Analysen vorhanden.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    {['Fall', 'Rechtsgebiet', 'Dringlichkeit', 'Confidence', 'Status', ''].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a, i) => {
                    const sc = STATUS_CONFIG[a.status];
                    const urg = URGENCY_CONFIG[a.cases?.urgency ?? 'normal'];
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/review/${a.id}`)}
                      >
                        <td className="px-8 py-5">
                          <p className="font-semibold text-sm text-[#1a1a2e] max-w-[200px] truncate">
                            {a.cases?.title ?? 'Unbekannter Fall'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {a.cases?.category ?? '-'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-sm font-semibold ${urg?.color ?? 'text-gray-500'}`}>
                            {urg?.label ?? a.cases?.urgency ?? '-'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <ConfidenceBar score={a.confidence_score} />
                          {a.needs_more_info && (
                            <p className="text-[10px] text-amber-600 mt-1 font-medium">Infos fehlen</p>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[#1a1a2e] transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
