import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Shield, 
  Bell, 
  Lock, 
  Download, 
  Trash2, 
  Check, 
  ChevronRight,
  ArrowRight,
  Scale
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAppContext();

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'billing', label: 'Abo & Abrechnung', icon: CreditCard },
    { id: 'security', label: 'Sicherheit', icon: Lock },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Tabs Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all",
                  activeTab === tab.id ? "bg-[#1a1a2e] text-white shadow-lg shadow-blue-900/20" : "text-gray-500 hover:bg-white hover:text-[#1a1a2e]"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Tab Content */}
          <div className="flex-grow space-y-8">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center text-3xl font-bold text-[#1a1a2e]">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#1a1a2e]">{user?.name}</h2>
                      <p className="text-gray-500">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-green-50 text-[#2d6a4f] rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                          {user?.plan} Plan
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Vollständiger Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="text" value={user?.name} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">E-Mail Adresse</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="email" value={user?.email} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Telefonnummer</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="tel" placeholder="+49 123 4567890" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Adresse</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="text" placeholder="Musterstraße 1, 12345 Berlin" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button className="bg-[#1a1a2e] text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all">
                      Änderungen speichern
                    </button>
                  </div>
                </section>

                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Datenmanagement</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-[#1a1a2e]">Alle Daten herunterladen</h4>
                        <p className="text-xs text-gray-500">Erhalte eine Kopie all deiner Fälle und Dokumente.</p>
                      </div>
                      <button className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-[#1a1a2e] transition-all">
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-red-600">Account löschen</h4>
                        <p className="text-xs text-red-400">Alle Daten werden unwiderruflich gelöscht.</p>
                      </div>
                      <button className="p-3 hover:bg-white rounded-xl text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section className="bg-[#1a1a2e] rounded-[32px] p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#2d6a4f] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Aktueller Plan</p>
                        <h2 className="text-4xl font-serif">{user?.plan.toUpperCase()}</h2>
                      </div>
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-[#2d6a4f]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 mb-10">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nächste Abrechnung</p>
                        <p className="text-lg font-bold">{format(new Date(user?.planEnd || ''), 'dd. MMMM yyyy', { locale: de })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preis</p>
                        <p className="text-lg font-bold">39,90 € / Monat</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="bg-[#2d6a4f] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1b4332] transition-all">
                        Plan upgraden
                      </button>
                      <button className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                        Abo kündigen
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Zahlungsmethode</h3>
                  <div className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">VISA</div>
                      <div>
                        <h4 className="font-bold text-[#1a1a2e]">•••• •••• •••• 4242</h4>
                        <p className="text-xs text-gray-500">Läuft ab am 12/28</p>
                      </div>
                    </div>
                    <button className="text-sm font-bold text-[#2d6a4f] hover:underline">Ändern</button>
                  </div>
                </section>

                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Rechnungsverlauf</h3>
                  <div className="space-y-4">
                    {[
                      { date: '2026-03-04', amount: '39,90 €', id: 'INV-2026-001' },
                      { date: '2026-02-04', amount: '39,90 €', id: 'INV-2026-002' },
                      { date: '2026-01-04', amount: '39,90 €', id: 'INV-2026-003' }
                    ].map(inv => (
                      <div key={inv.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-bold text-[#1a1a2e]">{inv.id}</p>
                          <p className="text-xs text-gray-500">{format(new Date(inv.date), 'dd. MMM yyyy', { locale: de })}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-[#1a1a2e]">{inv.amount}</span>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
