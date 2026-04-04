import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateEmail, validatePassword } from '../lib/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handlePasswordBlur = () => setPasswordError(validatePassword(password));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    setGeneralError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) navigate('/dashboard');
      } else {
        await new Promise(r => setTimeout(r, 800));
        setUser({
          id: crypto.randomUUID(), email, name: email.split('@')[0],
          plan: 'free', planStart: new Date().toISOString(),
          planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageThisMonth: 0, createdAt: new Date().toISOString(),
        });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.';
      setGeneralError(msg.toLowerCase().includes('invalid login') ? 'E-Mail oder Passwort ist falsch.' : msg.toLowerCase().includes('email not confirmed') ? 'Bitte bestätige zuerst deine E-Mail-Adresse.' : msg);
    } finally {
      setLoading(false);
    }
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
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Willkommen zurück</h1>
        <p className="text-sm text-slate-500 mb-7">
          Melde dich an, um auf deine Fälle zuzugreifen.
          {!isSupabaseConfigured && (
            <span className="block mt-1 text-xs text-amber-500 font-medium">Demo-Modus aktiv</span>
          )}
        </p>

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {generalError && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {generalError}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                onBlur={handleEmailBlur}
                className={fieldClass(!!emailError)}
                placeholder="name@beispiel.de"
                disabled={loading}
              />
            </div>
            {emailError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {emailError}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
                onBlur={handlePasswordBlur}
                className={fieldClass(!!passwordError) + ' pr-11'}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {passwordError}</p>}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Angemeldet bleiben
            </label>
            <a href="#" className="text-blue-600 font-semibold hover:underline">Passwort vergessen?</a>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-full text-sm font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Anmelden...</>
            ) : (
              <>Anmelden <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Noch keinen Account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Jetzt kostenlos registrieren</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
