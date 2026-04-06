// Variant B â Tiered nach Leistungstiefe
// Botschaft: "Zahle nur fÃ¼r das, was du wirklich brauchst â im Moment, wenn du es brauchst."

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, FileText, Scale } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingBProps {
  onCtaClick: (tier: string) => void;
}

const tiers = [
  {
    icon: Sparkles,
    name: 'ErsteinschÃ¤tzung',
    price: 'Kostenlos',
    priceNote: 'Kein Kreditkarte nÃ¶tig',
    color: 'slate',
    cta: 'Kostenlos starten',
    ctaStyle: 'bg-white/8 text-white hover:bg-white/12 border border-white/10',
    description: 'Versteh deine Rechtslage in Minuten â ohne Risiko.',
    features: [
      'KI-Analyse deines Falls',
      'EinschÃ¤tzung der Erfolgschancen',
      'Ãbersicht deiner Handlungsoptionen',
      'Sofortige Antwort, 24/7',
    ],
  },
  {
    icon: FileText,
    name: 'Musterbrief',
    price: '29 â¬',
    priceNote: 'einmalig, pro Fall',
    color: 'blue',
    popular: true,
    cta: 'Brief erstellen lassen',
    ctaStyle: 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20',
    description: 'Du weiÃt was Sache ist â jetzt brauchst du ein Schreiben das wirkt.',
    features: [
      'Alles aus ErsteinschÃ¤tzung',
      'Juristisch formulierter Musterbrief',
      'Individuell auf deinen Fall angepasst',
      'Anwaltlich geprÃ¼ft & verantwortet',
    ],
  },
  {
    icon: Scale,
    name: 'AnwaltsÃ¼bergabe',
    price: '99 â¬',
    priceNote: 'einmalig, inkl. ErstgesprÃ¤ch',
    color: 'violet',
    cta: 'Anwalt hinzuziehen',
    ctaStyle: 'bg-white/8 text-white hover:bg-white/12 border border-white/10',
    description: 'Dein Fall ist komplex oder geht vor Gericht â wir vermitteln den richtigen Anwalt.',
    features: [
      'Alles aus Musterbrief',
      'Vermittlung an Fachanwalt',
      '30-min ErstgesprÃ¤ch inklusive',
      'VollstÃ¤ndige FallÃ¼bergabe',
    ],
  },
];

const colorMap = {
  slate: {
    icon: 'bg-white/5 text-slate-400',
    badge: '',
    glow: '',
    border: 'border-white/8',
    bg: 'bg-white/[0.03]',
  },
  blue: {
    icon: 'bg-blue-500/15 text-blue-400',
    badge: 'bg-gradient-to-r from-blue-600 to-violet-600 text-white',
    glow: 'shadow-xl shadow-blue-500/10',
    border: 'border-blue-500/30',
    bg: 'bg-gradient-to-b from-blue-600/15 to-violet-600/8',
  },
  violet: {
    icon: 'bg-violet-500/15 text-violet-400',
    badge: '',
    glow: '',
    border: 'border-white/8',
    bg: 'bg-white/[0.03]',
  },
};

export const PricingB = ({ onCtaClick }: PricingBProps) => (
  <section id="pricing" className="py-24 px-6 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/7 rounded-full blur-[130px] pointer-events-none" />

    <div className="max-w-5xl mx-auto relative">

      {/* Header */}
      <div className="max-w-2xl mb-14">
        <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">Preise</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Zahle nur fÃ¼r das,<br />was du wirklich brauchst
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Kein Abo. Kein Paket kaufen auf Vorrat. Du zahlst im Moment, in dem du Hilfe brauchst â und genau so viel wie nÃ¶tig.
        </p>
      </div>

      {/* Tiers */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {tiers.map((tier, i) => {
          const c = colorMap[tier.color as keyof typeof colorMap];
          const Icon = tier.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn('p-7 rounded-2xl border flex flex-col relative', c.border, c.bg, c.glow)}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Beliebteste Wahl
                  </span>
                </div>
              )}

              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-5', c.icon)}>
                <Icon size={18} />
              </div>

              <p className="text-sm font-semibold text-slate-400 mb-1">{tier.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={cn('text-3xl font-bold', tier.price === 'Kostenlos' ? 'text-slate-300' : 'text-white')}>
                  {tier.price}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">{tier.priceNote}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{tier.description}</p>

              <ul className="space-y-2.5 mb-8 flex-grow">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className={cn('w-4 h-4 flex-shrink-0', tier.popular ? 'text-blue-400' : 'text-slate-500')} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                onClick={() => onCtaClick(tier.name)}
                className={cn('w-full py-3 rounded-full font-semibold text-center text-sm transition-all flex items-center justify-center gap-2 group', tier.ctaStyle)}
              >
                {tier.cta}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Flow hint */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs text-slate-600"
      >
        Die Stufen bauen aufeinander auf â du kannst jederzeit upgraden, wenn du mehr brauchst.
      </motion.p>

    </div>
  </section>
);
