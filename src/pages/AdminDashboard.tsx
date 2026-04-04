import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronRight,
  BarChart3,
  Scale
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function AdminDashboard() {
  const { cases } = useAppContext();

  const stats = [
    { label: 'Aktive Fälle', value: cases.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Warten auf Review', value: cases.filter(c => c.status === 'ai_analyse_abgeschlossen').length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Abgeschlossen', value: cases.filter(c => c.status === 'erledigt').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Durchschn. Confidence', value: '85%', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section>
          <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Lawyer Dashboard</h1>
          <p className="text-gray-500">Willkommen im Kontrollzentrum. Hier kannst du AI-Analysen prüfen und freigeben.</p>
        </section>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", s.bg)}>
                <s.icon className={cn("w-6 h-6", s.color)} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Case Queue */}
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Warteschlange</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Suchen..." className="pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-gray-200" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fall ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mandant</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rechtsgebiet</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Confidence</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-sm text-[#1a1a2e]">{c.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#1a1a2e]">SM</div>
                        <span className="text-sm font-medium text-[#1a1a2e]">Sarah Müller</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {c.rechtsgebiet}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2d6a4f] w-[85%]" />
                        </div>
                        <span className="text-xs font-bold text-[#2d6a4f]">85%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        c.status === 'ai_analyse_abgeschlossen' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-[#2d6a4f]"
                      )}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[#1a1a2e] transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
