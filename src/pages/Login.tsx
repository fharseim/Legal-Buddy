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

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

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
        if (data.user) {
          // AppContext onAuthStateChange will pick up the session automatically
          navigate('/dashboard');
        }
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 800));
        setUser({
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0],
          plan: 'free',
          planStart: new Date().toISOString(),
          planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageThisMonth: 0,
          createdAt: new Date().toISOString(),
        });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.';
      if (message.toLowerCase().includes('invalid login credentials')) {
        setGeneralError('E-Mail oder Passwort ist falsch.');
      } else if (message.toLowerCase().includes('email not confirmed')) {
        setGeneralError('Bitte bestätige zuerst deine E-Mail-Adresse.');
      } else {
        setGeneralError(message);
      }
    } finally {
      setLoading(false);
    }
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
        className="w-full max-w-md bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-10 border border-gray-100"
      >
        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-2">Willkommen zurück</h1>
        <p className="text-gray-500 mb-8">
          Melde dich an, um auf deine Fälle zuzugreifen.
          {!isSupabaseConfigured && (
            <span className="block mt-1 text-xs text-amber-600 font-medium">Demo-Modus aktiv</span>
          )}
        </p>

        <form onSubmit={handleLogin} noValidate className="space-y-5">
          {generalError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {generalError}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] mb-2">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                onBlur={handleEmailBlur}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl transition-all outline-none ${
                  emailError
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                    : 'border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50'
                }`}
                placeholder="name@beispiel.de"
                disabled={loading}
              />
            </div>
            {emailError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] mb-2">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
                onBlur={handlePasswordBlur}
                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl transition-all outline-none ${
                  passwordError
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                    : 'border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50'
                }`}
                placeholder="••••••••"
                disabled={loading}
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
            {passwordError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {passwordError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]" />
              Angemeldet bleiben
            </label>
            <a href="#" className="text-[#2d6a4f] font-bold hover:underline">Passwort vergessen?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Anmelden...
              </>
            ) : (
              <>
                Anmelden
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Noch keinen Account?{' '}
            <Link to="/register" className="text-[#2d6a4f] font-bold hover:underline">
              Jetzt kostenlos registrieren
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
