import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Mail, Lock, User, Check, Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateEmail, validatePassword, validateName, checkPasswordStrength } from '../lib/validation';
import { cn } from '../lib/utils';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', goal: '', plan: 'pro' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();
  const passwordStrength = checkPasswordStrength(formData.password);

  const validateStep1 = () => {
    const nErr = validateName(formData.name);
    const eErr = validateEmail(formData.email);
    const pErr = validatePassword(formData.password);
    const cErr = formData.confirmPassword !== formData.password ? 'Passwörter stimmen nicht überein.' : null;
    setNameError(nErr); setEmailError(eErr); setPasswordError(pErr); setConfirmPasswordError(cErr);
    return !nErr && !eErr && !pErr && !cErr;
  };

  const handleRegister = async () => {
    setLoading(true); setGeneralError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email, password: formData.password,
          options: { data: { name: formData.name, plan: formData.plan, goal: formData.goal } },
        });
        if (error) throw error;
        if (data.session) navigate('/dashboard');
        else navigate('/login?confirmed=pending');
      } else {
        await new Promise(r => setTimeout(r, 800));
        setUser({
          id: crypto.randomUUID(), email: formData.email, name: formData.name,
          plan: formData.plan as 'free' | 'buddy' | 'pro' | 'familie',
          planStart: new Date().toISOString(), planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageThisMonth: 0, createdAt: new Date().toISOString(),
        });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.';
      setGeneralError(msg.toLowerCase().includes('already') ? 'Diese E-Mail-Adresse ist bereits registriert.' : msg);
      if (msg.toLowerCase().includes('already')) setStep(1);
    } finally { setLoading(false); }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm transition-all outline-none ${
      hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
        : 'border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Scale className="text-white w-4 h-4" />
        </div>
        <span className="text-base font-bold text-slate-900">Legal Buddy</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn('h-1 flex-1 rounded-full transition-all duration-300', step >= s ? 'bg-blue-600' : 'bg-slate-100')} />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Kostenlos registrieren</h1>
            <p className="text-sm text-slate-500 mb-7">
              In weniger als 2 Minuten zu deinem Recht.
              {!isSupabaseConfigured && <span className="block mt-1 text-xs text-amber-500 font-medium">Demo-Modus aktiv</span>}
            </p>

            {generalError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 border border-red-100 mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {generalError}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dein Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); if (nameError) setNameError(validateName(e.target.value)); }}
                    onBlur={() => setNameError(validateName(formData.name))}
                    className={fieldClass(!!nameError)} placeholder="Sarah Müller" />
                </div>
                {nameError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {nameError}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-Mail Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="email" value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                    onBlur={() => setEmailError(validateEmail(formData.email))}
                    className={fieldClass(!!emailError)} placeholder="name@beispiel.de" />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={(e) => { setFormData({...formData, password: e.target.value}); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
                    onBlur={() => setPasswordError(validatePassword(formData.password))}
                    className={fieldClass(!!passwordError) + ' pr-11'} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {passwordError}</p>}
                {formData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ backgroundColor: i < passwordStrength.score ? passwordStrength.color : '#e2e8f0' }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                    onChange={(e) => { setFormData({...formData, confirmPassword: e.target.value}); if (confirmPasswordError) setConfirmPasswordError(e.target.value !== formData.password ? 'Passwörter stimmen nicht überein.' : null); }}
                    onBlur={() => setConfirmPasswordError(formData.confirmPassword !== formData.password ? 'Passwörter stimmen nicht überein.' : null)}
                    className={fieldClass(!!confirmPasswordError) + ' pr-11'} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {confirmPasswordError}</p>}
                {!confirmPasswordError && formData.confirmPassword.length > 0 && formData.confirmPassword === formData.password && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Passwörter stimmen überein</p>
                )}
              </div>

              <button onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full bg-slate-900 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 group mt-2">
                Weiter <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Was führt dich zu uns?</h1>
            <p className="text-sm text-slate-500 mb-7">Wir passen dein Erlebnis an deine Bedürfnisse an.</p>
            <div className="space-y-3">
              {[
                { id: 'problem', title: 'Ich habe ein konkretes Rechtsproblem', desc: 'Z.B. Ärger mit einem Online-Shop oder Vermieter.' },
                { id: 'contract', title: 'Ich möchte einen Vertrag prüfen lassen', desc: 'Z.B. Arbeitsvertrag oder Mietvertrag vor Unterschrift.' },
                { id: 'safety', title: 'Ich möchte mich allgemein absichern', desc: 'Präventiver Schutz für mich und meine Familie.' },
              ].map(goal => (
                <button key={goal.id} onClick={() => setFormData({...formData, goal: goal.id})}
                  className={cn('w-full p-5 rounded-xl border text-left transition-all',
                    formData.goal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white')}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-slate-900">{goal.title}</span>
                    {formData.goal === goal.id && <Check className="text-blue-600 w-4 h-4" />}
                  </div>
                  <p className="text-xs text-slate-500">{goal.desc}</p>
                </button>
              ))}
              <button onClick={() => setStep(3)} disabled={!formData.goal}
                className="w-full bg-slate-900 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Wähle deinen Plan</h1>
            <p className="text-sm text-slate-500 mb-7">Teste Legal Buddy 14 Tage kostenlos.</p>

            {generalError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 border border-red-100 mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {generalError}
              </div>
            )}

            <div className="space-y-3">
              {[
                { id: 'buddy', name: 'Buddy', price: '19,90€', desc: 'Für gelegentliche Anliegen.' },
                { id: 'pro', name: 'Pro', price: '39,90€', desc: 'Der Rundum-Schutz für dich.', recommended: true },
                { id: 'familie', name: 'Familie', price: '49,90€', desc: 'Sicherheit für die ganze Familie.' },
              ].map(plan => (
                <button key={plan.id} onClick={() => setFormData({...formData, plan: plan.id})}
                  className={cn('w-full p-5 rounded-xl border text-left transition-all relative',
                    formData.plan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white')}>
                  {plan.recommended && (
                    <span className="absolute top-3.5 right-4 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">Empfohlen</span>
                  )}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-slate-900">{plan.name}</span>
                    <span className="text-sm font-bold text-slate-900">{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                </button>
              ))}

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3">
                <Shield className="text-slate-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">14 Tage kostenlos testen.</strong> Keine Belastung heute. Jederzeit kündbar.
                </p>
              </div>

              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Konto wird erstellt...</> : 'Registrierung abschließen'}
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Bereits Mitglied?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Hier anmelden</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
