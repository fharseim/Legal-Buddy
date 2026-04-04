import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Mock login
      setUser({
        id: '1',
        email,
        name: 'Sarah Müller',
        plan: 'pro',
        planStart: new Date().toISOString(),
        planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageThisMonth: 2,
        createdAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } else {
      setError('Bitte fülle alle Felder aus.');
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
        <p className="text-gray-500 mb-8">Melde dich an, um auf deine Fälle zuzugreifen.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] mb-2">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-green-50 rounded-2xl transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
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
            className="w-full bg-[#1a1a2e] text-white py-4 rounded-full font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group"
          >
            Anmelden
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Noch keinen Account? <Link to="/register" className="text-[#2d6a4f] font-bold hover:underline">Jetzt kostenlos registrieren</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
