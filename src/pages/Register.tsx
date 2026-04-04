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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: '',
    plan: 'pro',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field errors for step 1
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
    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);
    return !nErr && !eErr && !pErr && !cErr;
  };

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    setGeneralError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name, plan: formData.plan, goal: formData.goal },
          },
        });
        if (error) throw error;
        if (data.user) {
          // If email confirmation required, user won't have a session yet
          if (data.session) {
            navigate('/dashboard');
          } else {
            // Show confirmation hint and redirect to login
            navigate('/login?confirmed=pending');
          }
        }
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 800));
        setUser({
          id: crypto.randomUUID(),
          email: formData.email,
          name: formData.name,
          plan: formData.plan as 'free' | 'buddy' | 'pro' | 'familie',
          planStart: new Date().toISOString(),
          planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageThisMonth: 0,
          createdAt: new Date().toISOString(),
        });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.';
      if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already exists')) {
        setGeneralError('Diese E-Mail-Adresse ist bereits registriert.');
        setStep(1);
      } else {
        setGeneralError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl transition-all outline-none ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-50'
        : 'border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50'
    }`;

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
            <div
              key={s}
              className={cn(
                'h-1.5 flex-grow rounded-full transition-all',
                step >= s ? 'bg-[#2d6a4f]' : 'bg-gray-100'
              )}
            />
          ))}
        </div>

        {/* ── STEP 1: Account Details ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Kostenlos registrieren</h1>
            <p className="text-gray-500 mb-8">
              In weniger als 2 Minuten zu deinem Recht.
              {!isSupabaseConfigured && (
                <span className="block mt-1 text-xs text-amber-600 font-medium">Demo-Modus aktiv</span>
              )}
            </p>

            {generalError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {generalError}
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Dein Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (nameError) setNameError(validateName(e.target.value)); }}
                    onBlur={() => setNameError(validateName(formData.name))}
                    className={inputClass(!!nameError) }
                    placeholder="Sarah Müller"
                  />
                </div>
                {nameError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {nameError}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">E-Mail Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                    onBlur={() => setEmailError(validateEmail(formData.email))}
                    className={inputClass(!!emailError)}
                    placeholder="name@beispiel.de"
                  />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
                    onBlur={() => setPasswordError(validatePassword(formData.password))}
                    className={inputClass(!!passwordError) + ' pr-12'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {passwordError}</p>}

                {/* Password Strength Meter */}
                {formData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{ backgroundColor: i < passwordStrength.score ? passwordStrength.color : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (confirmPasswordError) setConfirmPasswordError(e.target.value !== formData.password ? 'Passwörter stimmen nicht überein.' : null);
                    }}
                    onBlur={() => setConfirmPasswordError(formData.confirmPassword !== formData.password ? 'Passwörter stimmen nicht überein.' : null)}
                    className={inputClass(!!confirmPasswordError) + ' pr-12'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPasswordError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {confirmPasswordError}</p>}
                {!confirmPasswordError && formData.confirmPassword.length > 0 && formData.confirmPassword === formData.password && (
                  <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Passwörter stimmen überein</p>
                )}
              </div>

              <button
                onClick={handleStep1Next}
                className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group"
              >
                Weiter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Goal Selection ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Was führt dich zu uns?</h1>
            <p className="text-gray-500 mb-8">Wir passen dein Erlebnis an deine Bedürfnisse an.</p>
            <div className="space-y-4">
              {[
                { id: 'problem', title: 'Ich habe ein konkretes Rechtsproblem', desc: 'Z.B. Ärger mit einem Online-Shop oder Vermieter.' },
                { id: 'contract', title: 'Ich möchte einen Vertrag prüfen lassen', desc: 'Z.B. Arbeitsvertrag oder Mietvertrag vor Unterschrift.' },
                { id: 'safety', title: 'Ich möchte mich allgemein absichern', desc: 'Präventiver Schutz für mich und meine Familie.' },
              ].map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setFormData({ ...formData, goal: goal.id })}
                  className={cn(
                    'w-full p-6 rounded-2xl border text-left transition-all',
                    formData.goal === goal.id ? 'border-[#2d6a4f] bg-green-50' : 'border-gray-100 hover:border-gray-300'
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
                className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Plan Selection ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Wähle deinen Plan</h1>
            <p className="text-gray-500 mb-8">Teste Legal Buddy 14 Tage kostenlos.</p>

            {generalError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {generalError}
              </div>
            )}

            <div className="space-y-4">
              {[
                { id: 'buddy', name: 'Buddy', price: '19,90€', desc: 'Für gelegentliche Anliegen.' },
                { id: 'pro', name: 'Pro', price: '39,90€', desc: 'Der Rundum-Schutz für dich.', recommended: true },
                { id: 'familie', name: 'Familie', price: '49,90€', desc: 'Sicherheit für die ganze Familie.' },
              ].map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  className={cn(
                    'w-full p-6 rounded-2xl border text-left transition-all relative',
                    formData.plan === plan.id ? 'border-[#2d6a4f] bg-green-50' : 'border-gray-100 hover:border-gray-300'
                  )}
                >
                  {plan.recommended && (
                    <span className="absolute top-4 right-4 bg-[#2d6a4f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Empfohlen
                    </span>
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
                disabled={loading}
                className="w-full bg-[#2d6a4f] text-white py-4 rounded-full font-bold hover:bg-[#1b4332] transition-all mt-6 shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Konto wird erstellt...
                  </>
                ) : (
                  'Registrierung abschließen'
                )}
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Bereits Mitglied?{' '}
            <Link to="/login" className="text-[#2d6a4f] font-bold hover:underline">
              Hier anmelden
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
