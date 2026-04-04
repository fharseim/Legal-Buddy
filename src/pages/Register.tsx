import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Mail, Lock, User, Check, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    goal: '',
    plan: 'pro'
  });
  
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleRegister = () => {
    setUser({
      id: '1',
      email: formData.email,
      name: formData.name,
      plan: formData.plan as any,
      planStart: new Date().toISOString(),
      planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageThisMonth: 0,
      createdAt: new Date().toISOString()
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center">
          <Scale className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#1a1a2e]">Legal Buddy</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-10 border border-gray-100"
      >
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn(
              "h-1.5 flex-grow rounded-full transition-all",
              step >= s ? "bg-[#2d6a4f]" : "bg-gray-100"
            )} />
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Kostenlos registrieren</h1>
            <p className="text-gray-500 mb-8">In weniger als 2 Minuten zu deinem Recht.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Dein Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                    placeholder="Sarah Müller"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">E-Mail Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                    placeholder="name@beispiel.de"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.password}
                className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Was führt dich zu uns?</h1>
            <p className="text-gray-500 mb-8">Wir passen dein Erlebnis an deine Bedürfnisse an.</p>

            <div className="space-y-4">
              {[
                { id: 'problem', title: 'Ich habe ein konkretes Rechtsproblem', desc: 'Z.B. Ärger mit einem Online-Shop oder Vermieter.' },
                { id: 'contract', title: 'Ich möchte einen Vertrag prüfen lassen', desc: 'Z.B. Arbeitsvertrag oder Mietvertrag vor Unterschrift.' },
                { id: 'safety', title: 'Ich möchte mich allgemein absichern', desc: 'Präventiver Schutz für mich und meine Familie.' }
              ].map(goal => (
                <button 
                  key={goal.id}
                  onClick={() => setFormData({...formData, goal: goal.id})}
                  className={cn(
                    "w-full p-6 rounded-2xl border text-left transition-all",
                    formData.goal === goal.id ? "border-[#2d6a4f] bg-green-50" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1a1a2e]">{goal.title}</span>
                    {formData.goal === goal.id && <Check className="text-[#2d6a4f] w-5 h-5" />}
                  </div>
                  <p className="text-sm text-gray-500">{goal.desc}</p>
                </button>
              ))}
              <button 
                onClick={() => setStep(3)}
                disabled={!formData.goal}
                className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all mt-6 disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Wähle deinen Plan</h1>
            <p className="text-gray-500 mb-8">Teste Legal Buddy 14 Tage kostenlos.</p>

            <div className="space-y-4">
              {[
                { id: 'buddy', name: 'Buddy', price: '19,90€', desc: 'Für gelegentliche Anliegen.' },
                { id: 'pro', name: 'Pro', price: '39,90€', desc: 'Der Rundum-Schutz für dich.', recommended: true },
                { id: 'familie', name: 'Familie', price: '49,90€', desc: 'Sicherheit für die ganze Familie.' }
              ].map(plan => (
                <button 
                  key={plan.id}
                  onClick={() => setFormData({...formData, plan: plan.id})}
                  className={cn(
                    "w-full p-6 rounded-2xl border text-left transition-all relative",
                    formData.plan === plan.id ? "border-[#2d6a4f] bg-green-50" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  {plan.recommended && (
                    <span className="absolute top-4 right-4 bg-[#2d6a4f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Empfohlen</span>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1a1a2e]">{plan.name}</span>
                    <span className="font-bold text-[#1a1a2e]">{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </button>
              ))}
              <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 mt-6">
                <Shield className="text-blue-600 w-5 h-5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>14 Tage kostenlos testen.</strong> Keine Belastung heute. Du kannst jederzeit während der Testphase kündigen.
                </p>
              </div>
              <button 
                onClick={handleRegister}
                className="w-full bg-[#2d6a4f] text-white py-4 rounded-full font-bold hover:bg-[#1b4332] transition-all mt-6 shadow-lg shadow-green-900/10"
              >
                Registrierung abschließen
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Bereits Mitglied? <Link to="/login" className="text-[#2d6a4f] font-bold hover:underline">Hier anmelden</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
