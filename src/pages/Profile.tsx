import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  ShoppingCart,
  Loader2,
  Zap,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { creditService, type UserCredits, type CreditPurchase } from '../services/creditService';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const paymentSuccess = searchParams.get('payment') === 'success';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAppContext();

  // Credits state
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'billing', label: 'Abo & Abrechnung', icon: CreditCard },
    { id: 'security', label: 'Sicherheit', icon: Lock },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  ];

  // Load billing data when billing tab is active
  useEffect(() => {
    if (activeTab === 'billing') {
      setBillingLoading(true);
      Promise.all([creditService.getCredits(), creditService.getPurchases()]).then(
        ([c, p]) => {
          setCredits(c);
          setPurchases(p);
          setBillingLoading(false);
        }
      );
    }
  }, [activeTab]);

  const handleBuyCredit = async () => {
    if (!user) return;
    try {
      setCheckingOut(true);
      setCheckoutError(null);
      const url = await creditService.createCheckoutSession(user.id, user.email);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setCheckoutError('Zahlung konnte nicht initiiert werden. Bitte versuche es erneut.');
      setCheckingOut(false);
    }
  };

  const creditsRemaining = credits?.credits_remaining ?? 0;

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
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all',
                  activeTab === tab.id
                    ? 'bg-[#1a1a2e] text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-500 hover:bg-white hover:text-[#1a1a2e]'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Tab Content */}
          <div className="flex-grow space-y-8">

            {/* ── Profil ──────────────────────────────────────────────── */}
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
                          Pay-per-Case
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Vollständiger Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="text" defaultValue={user?.name} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" />
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

            {/* ── Billing ───────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                {/* Payment success banner */}
                {paymentSuccess && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">
                      Zahlung erfolgreich! Dein Credit wurde hinzugefügt. Du kannst jetzt einen Fall erstellen.
                    </p>
                  </div>
                )}

                {/* Credit balance card */}
                <section className="bg-[#1a1a2e] rounded-[32px] p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#2d6a4f] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Modell</p>
                        <h2 className="text-3xl font-serif">Pay-per-Case</h2>
                      </div>
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-yellow-300" />
                      </div>
                    </div>

                    {billingLoading ? (
                      <div className="flex items-center gap-3 text-gray-400 mb-10">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Lade Kontodaten…</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-10 mb-10">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verfügbare Credits</p>
                          <p className="text-4xl font-bold text-white">{creditsRemaining}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {credits?.credits_used ?? 0} bisher verwendet
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preis pro Analyse</p>
                          <p className="text-4xl font-bold text-white">9,90 €</p>
                          <p className="text-xs text-gray-400 mt-1">inkl. MwSt.</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBuyCredit}
                      disabled={checkingOut}
                      className="flex items-center gap-2 bg-white text-[#1a1a2e] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all disabled:opacity-60"
                    >
                      {checkingOut ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                      Analyse kaufen – 9,90 €
                    </button>

                    {checkoutError && (
                      <p className="text-sm text-red-300 mt-3">{checkoutError}</p>
                    )}
                  </div>
                </section>

                {/* What's included */}
                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Was ist enthalten?</h3>
                  <div className="space-y-4">
                    {[
                      { icon: '🤖', title: 'KI-Ersteinschätzung', desc: 'Automatische Analyse deines Falls durch Gemini AI — in Sekunden.' },
                      { icon: '⚖️', title: 'Anwaltliche Prüfung', desc: 'Ein Rechtsexperte prüft und ergänzt die KI-Analyse manuell.' },
                      { icon: '📋', title: 'Handlungsempfehlungen', desc: 'Konkrete nächste Schritte und Erfolgsaussichten.' },
                      { icon: '📂', title: 'Fallakte', desc: 'Dein Fall und alle Dokumente bleiben dauerhaft in deiner Akte gespeichert.' },
                    ].map(item => (
                      <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-[#1a1a2e] text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Purchase history */}
                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Zahlungsverlauf</h3>
                  {billingLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Lädt…</span>
                    </div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-sm">Noch keine Käufe vorhanden.</p>
                      <button
                        onClick={handleBuyCredit}
                        disabled={checkingOut}
                        className="mt-4 text-sm font-bold text-[#2d6a4f] hover:underline"
                      >
                        Erste Analyse kaufen →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-bold text-[#1a1a2e]">Rechtsfall-Analyse</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(p.paid_at), 'dd. MMM yyyy, HH:mm', { locale: de })} Uhr
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-bold text-[#1a1a2e]">
                              {((p.amount_cents ?? 990) / 100).toFixed(2).replace('.', ',')} €
                            </span>
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                              Bezahlt
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* ── Security ──────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Passwort ändern</h3>
                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Aktuelles Passwort</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" placeholder="••••••••" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Neues Passwort</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" placeholder="••••••••" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Passwort bestätigen</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input type="password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium outline-none" placeholder="••••••••" />
                      </div>
                    </div>
                    <button className="bg-[#1a1a2e] text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all">
                      Passwort aktualisieren
                    </button>
                  </div>
                </section>

                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Aktive Sitzungen</h3>
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a2e]">Aktuelle Sitzung</p>
                        <p className="text-xs text-gray-500">Zuletzt aktiv: gerade eben</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">Aktiv</span>
                  </div>
                </section>
              </motion.div>
            )}

            {/* ── Notifications ─────────────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-6">Benachrichtigungseinstellungen</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Analyse abgeschlossen', desc: 'Wenn deine KI-Analyse fertig ist', defaultOn: true },
                      { label: 'Anwalt hat geprüft', desc: 'Wenn ein Rechtsexperte deinen Fall überprüft hat', defaultOn: true },
                      { label: 'Neue Nachrichten', desc: 'Wenn du eine Nachricht in deiner Fallakte erhältst', defaultOn: true },
                      { label: 'Frist-Erinnerungen', desc: '3 Tage vor einer wichtigen Frist', defaultOn: false },
                      { label: 'Produktupdates', desc: 'Neue Features und Verbesserungen', defaultOn: false },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-[#1a1a2e] text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a2e]" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                    <button className="bg-[#1a1a2e] text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all">
                      Einstellungen speichern
                    </button>
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
