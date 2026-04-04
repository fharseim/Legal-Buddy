import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Plus, 
  Scale, 
  FileText, 
  Clock, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  Download
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const { user, cases } = useAppContext();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const activeCases = cases.filter(c => c.status !== 'erledigt' && c.status !== 'archiviert');
  const allCases = cases;
  const recentDocs = cases.flatMap(c => c.generatedDocuments).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const upcomingDeadlines = cases.flatMap(c => c.fristen.filter(f => f.status === 'aktiv')).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Welcome Section */}
            <section>
              <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Hallo {user?.name?.split(' ')[0]}, wie können wir dir helfen?</h1>
              <p className="text-gray-500">Hier ist eine Übersicht deiner aktuellen Rechtsangelegenheiten.</p>
            </section>

            {/* Quick Actions */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/intake" className="group bg-[#2d6a4f] p-8 rounded-[32px] text-white shadow-xl shadow-green-900/10 hover:bg-[#1b4332] transition-all">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Neues Anliegen</h3>
                <p className="text-green-100/80 text-sm mb-6">Schildere uns deinen Fall und erhalte sofort eine AI-Ersteinschätzung.</p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  Jetzt starten <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/intake?type=vertragscheck" className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Scale className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Vertrag prüfen</h3>
                <p className="text-gray-500 text-sm mb-6">Lade einen Vertrag hoch und lass ihn auf Risiken und Fairness prüfen.</p>
                <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e]">
                  Vertrag hochladen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                      <Shield className="text-purple-600 w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-[#2d6a4f] rounded-full text-[10px] font-bold uppercase tracking-wider">Aktiv</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">{user?.plan.toUpperCase()} Plan</h3>
                  <p className="text-gray-500 text-sm">{user?.usageThisMonth}/3 Anliegen diesen Monat genutzt.</p>
                </div>
                <Link to="/profile?tab=billing" className="mt-6 text-sm font-bold text-[#2d6a4f] hover:underline">Plan verwalten</Link>
              </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Active Cases */}
              <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1a1a2e]">Aktive Fälle</h2>
                  <Link to="/dashboard?tab=cases" className="text-sm font-bold text-[#2d6a4f] hover:underline">Alle ansehen</Link>
                </div>
                
                <div className="space-y-4">
                  {activeCases.length > 0 ? (
                    activeCases.map(c => (
                      <Link 
                        key={c.id} 
                        to={`/case/${c.id}`}
                        className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-gray-100 hover:shadow-lg transition-all group"
                      >
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 transition-colors">
                          <Briefcase className="w-6 h-6 text-gray-400 group-hover:text-[#2d6a4f]" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-[#1a1a2e] truncate">{c.titel}</h4>
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              c.status === 'ai_analyse_abgeschlossen' ? "bg-green-100 text-[#2d6a4f]" : "bg-blue-100 text-blue-600"
                            )}>
                              {c.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Zuletzt aktualisiert am {format(new Date(c.updatedAt), 'dd. MMM yyyy', { locale: de })}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a1a2e] transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="font-bold text-[#1a1a2e] mb-2">Noch keine aktiven Fälle</h3>
                      <p className="text-sm text-gray-500 mb-6">Starte jetzt dein erstes Anliegen und lass dich von Legal Buddy unterstützen.</p>
                      <Link to="/intake" className="inline-flex items-center gap-2 text-[#2d6a4f] font-bold hover:underline">
                        Jetzt starten <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Sidebar Widgets */}
              <aside className="space-y-10">
                {/* Deadlines */}
                <section className="space-y-6">
                  <h2 className="text-xl font-bold text-[#1a1a2e]">Anstehende Fristen</h2>
                  <div className="space-y-3">
                    {upcomingDeadlines.slice(0, 3).map(d => (
                      <div key={d.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          new Date(d.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                        )}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1a1a2e]">{d.name}</h4>
                          <p className="text-xs text-gray-500">{format(new Date(d.deadline), 'dd. MMMM yyyy', { locale: de })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </motion.div>
        )}

        {activeTab === 'cases' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Meine Fälle</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {allCases.map(c => (
                <Link key={c.id} to={`/case/${c.id}`} className="p-8 bg-white rounded-[32px] border border-gray-100 hover:shadow-xl transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">{c.rechtsgebiet}</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      c.status === 'ai_analyse_abgeschlossen' ? "bg-green-100 text-[#2d6a4f]" : "bg-blue-100 text-blue-600"
                    )}>{c.status.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">{c.titel}</h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 italic">"{c.sachverhalt.freitext}"</p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-xs text-gray-400">ID: {c.id}</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e]">
                      Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Meine Dokumente</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDocs.map(doc => (
                <div key={doc.id} className="p-8 bg-white rounded-[32px] border border-gray-100 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:text-[#2d6a4f] transition-colors">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-1 truncate">{doc.titel}</h3>
                  <p className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-widest mb-6">{doc.reviewStatus.replace('_', ' ')}</p>
                  <div className="flex items-center gap-3">
                    <button className="flex-grow bg-[#1a1a2e] text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-all">Vorschau</button>
                    <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-[#1a1a2e] transition-all"><Download className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'deadlines' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Fristen & Termine</h2>
            <div className="space-y-4">
              {upcomingDeadlines.map(d => (
                <div key={d.id} className="p-6 bg-white rounded-[24px] border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      new Date(d.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    )}>
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1a2e]">{d.name}</h3>
                      <p className="text-sm text-gray-500">{format(new Date(d.deadline), 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      new Date(d.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {Math.ceil((new Date(d.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tage verbleibend
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
