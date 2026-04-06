// Variant A — Flat Rate, Zeit als Hauptargument
// Botschaft: "Dein Problem gelöst in 2 Minuten, nicht in 4 Wochen. Für 29 €."

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, X, Clock, Zap, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingAProps {
  onCtaClick: () => void;
}

export const PricingA = ({ onCtaClick }: PricingAProps) => {
  const comparisons = [
    { label: 'Erste Antwort', buddy: '< 2 Minuten', anwalt: '1–4 Wochen', buddyWins: true },
    { label: 'Verfügbar', buddy: '24/7, sofort', anwalt: 'Mo–Fr, Bürozeiten', buddyWins: true },
    { label: 'Kosten', buddy: '29 €', anwalt: '190–600 €', buddyWins: true },
    { label: 'Musterbrief', buddy: 'Inklusive', anwalt: 'Extra berechnet', buddyWins: true },
    { label: 'Gerichtsvertretung', buddy: 'Anwaltsvermittlung', anwalt: 'Vollständig', buddyWins: false },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">Preise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
            Dein Recht.<br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              In 2 Minuten, nicht in 4 Wochen.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Ein Fall. Ein Preis. Keine Wartezeit.
          </p>
        </div>

        {/* Time comparison — the main visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 mb-6"
        >
          {/* Lawyer */}
          <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Herkömmlicher Anwalt</p>
            </div>
            <div className="mb-2">
              <span className="text-6xl font-bold text-white/20">4</span>
              <span className="text-2xl font-bold text-white/20 ml-1">Wochen</span>
            </div>
            <p className="text-slate-600 text-sm mb-6">bis zur ersten Einschätzung</p>
            <div className="space-y-2.5">
              {['Termin vereinbaren', 'Unterlagen zusammensuchen', 'Warten. Warten. Warten.', 'Mindestens 190 € zahlen'].map(t => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <X className="w-3.5 h-3.5 flex-shrink-0 text-red-500/50" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Legal Buddy */}
          <div className="p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[70px]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Legal Buddy</p>
            </div>
            <div className="mb-2">
              <span className="text-6xl font-bold text-white">2</span>
              <span className="text-2xl font-bold text-white ml-1">Minuten</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">bis zur ersten Einschätzung</p>
            <div className="space-y-2.5">
              {['Jetzt sofort starten', 'Musterbrief automatisch erstellt', 'Schritt-für-Schritt-Plan', 'Anwaltlich geprüft & verantwortet'].map(t => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden mb-14"
        >
          <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/8">
            <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Kriterium</div>
            <div className="px-6 py-4 text-xs font-semibold text-blue-400 uppercase tracking-widest border-l border-white/8">Legal Buddy</div>
            <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-l border-white/8">Anwaltskanzlei</div>
          </div>
          {comparisons.map((row, i) => (
            <div key={i} className={cn('grid grid-cols-3', i < comparisons.length - 1 && 'border-b border-white/5')}>
              <div className="px-6 py-4 text-sm text-slate-400">{row.label}</div>
              <div className={cn('px-6 py-4 text-sm font-medium border-l border-white/8 flex items-center gap-1.5', row.buddyWins ? 'text-blue-400' : 'text-slate-500')}>
                {row.buddyWins && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                {row.buddy}
              </div>
              <div className={cn('px-6 py-4 text-sm border-l border-white/8', row.buddyWins ? 'text-slate-600' : 'text-slate-300')}>{row.anwalt}</div>
            </div>
          ))}
        </motion.div>

        {/* The single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-baseline gap-1 mb-2">
            <span className="text-6xl font-bold text-white">29</span>
            <span className="text-2xl font-bold text-white">€</span>
            <span className="text-slate-500 text-lg ml-1">pro Fall</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">
            Kein Abo · Keine Mindestlaufzeit · Anwaltlich verantwortet
          </p>
          <Link
            to="/register"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-4 rounded-full font-semibold text-base hover:opacity-90 transition-opacity shadow-2xl shadow-blue-500/25 group"
          >
            Jetzt sofort Hilfe bekommen
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-slate-600 text-xs mt-4">Erste Einschätzung kostenlos · Zahlung erst bei Ergebnis</p>
        </motion.div>

      </div>
    </section>
  );
};
