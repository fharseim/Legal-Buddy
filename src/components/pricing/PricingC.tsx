// Variant C â Freemium-Einstieg
// Botschaft: "Fang kostenlos an. Zahle erst, wenn du das Ergebnis willst."
// Psychologie: Senkt die Eintrittsschwelle auf null â Nutzer starten risikolos,
//              dann zahlen sie fÃ¼r den konkreten Output den sie brauchen.

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Lock } from 'lucide-react';

interface PricingCProps {
  onCtaClick: (action: 'free' | 'paid') => void;
}

const freeFeatures = [
  'KI-EinschÃ¤tzung deiner Rechtslage',
  'Erfolgschancen-Analyse',
  'Handlungsoptionen im Ãberblick',
  'Sofort, ohne Wartezeit',
];

const paidFeatures = [
  'Juristisch formulierter Musterbrief',
  'Individuell auf deinen Fall zugeschnitten',
  'Anwaltlich geprÃ¼ft & verantwortet',
  'Schritt-fÃ¼r-Schritt-Umsetzungsplan',
];

export const PricingC = ({ onCtaClick }: PricingCProps) => (
  <section id="pricing" className="py-24 px-6 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] bg-blue-600/7 rounded-full blur-[130px] pointer-events-none" />

    <div className="max-w-4xl mx-auto relative">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">Preise</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Starte kostenlos.<br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Zahle erst, wenn du das Ergebnis willst.
          </span>
        </h2>
        <p className="text-slate-400 leading-relaxed max-w-lg mx-auto">
          Kein Kreditkarte beim Start. Kein Abo. Du siehst deine EinschÃ¤tzung zuerst â und entscheidest dann selbst.
        </p>
      </motion.div>

      {/* Two-step flow visual */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        {/* Step 1 â Free */}
        <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.03] relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-sm font-bold text-white">1</div>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">ErsteinschÃ¤tzung</h3>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-white">Kostenlos</span>
          </div>
          <p className="text-xs text-slate-600 mb-5">Kein Kreditkarte Â· Kein Abo Â· Sofort</p>
          <ul className="space-y-2.5 mb-8">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            onClick={() => onCtaClick('free')}
            className="w-full py-3 rounded-full font-semibold text-center text-sm bg-white/8 text-white hover:bg-white/12 border border-white/10 transition-all block"
          >
            Kostenlos starten
          </Link>
        </div>

        {/* Step 2 â Paid unlock */}
        <div className="p-8 rounded-2xl border border-blue-500/25 bg-gradient-to-b from-blue-600/15 to-violet-600/8 relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/8 rounded-full blur-[60px]" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300">2</div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Musterbrief & LÃ¶sung</h3>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-white">29 â¬</span>
            <span className="text-slate-400 text-sm">einmalig</span>
          </div>
          <p className="text-xs text-slate-500 mb-5">Nur wenn du das Ergebnis wirklich brauchst</p>
          <ul className="space-y-2.5 mb-8">
            {paidFeatures.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            onClick={() => onCtaClick('paid')}
            className="w-full py-3 rounded-full font-semibold text-center text-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            Jetzt loslegen
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Trust note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-slate-600"
      >
        Alle Preise inkl. MwSt. Â· Sichere Zahlung via Stripe Â· Kein verstecktes Abo
      </motion.p>

    </div>
  </section>
);
