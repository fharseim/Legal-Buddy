import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Scale, FileCheck, MessageSquare, ChevronDown, Check, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4',
      isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Scale className="text-white w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white">Legal Buddy</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">So funktioniert's</a>
          <a href="#rechtsgebiete" className="text-sm text-slate-400 hover:text-white transition-colors">Rechtsgebiete</a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Preise</a>
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">
            Kostenlos starten
          </Link>
        </div>
        <button className="md:hidden p-2 text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
        >
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-300">So funktioniert's</a>
          <a href="#rechtsgebiete" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-300">Rechtsgebiete</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-300">Preise</a>
          <Link to="/login" className="text-sm text-slate-300">Login</Link>
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl text-center text-sm font-semibold">
            Kostenlos starten
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-20 pb-24 px-6 bg-[#05050a] overflow-hidden">
    {/* Background glows */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 text-blue-400 rounded-full text-xs font-semibold mb-8 border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          AI-gestützt &amp; anwaltlich geprüft
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.06] tracking-tight mb-6">
          <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-cyan-200 bg-clip-text text-transparent">
            Dein Recht.
          </span>
          <br />
          <span className="text-white/75">Verständlich.</span>
          <br />
          <span className="text-white">Sofort.</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
          Dein AI-Rechtsassistent für Mietrecht, Verbraucherrecht und Arbeitsrecht. Ohne Anwaltskanzlei, ohne Wartezeit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-7 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/20"
          >
            Jetzt kostenlos starten
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="px-7 py-3.5 rounded-full font-semibold text-slate-200 hover:text-white border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center"
          >
            So funktioniert's
          </a>
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-[#05050a] opacity-80`} />
            ))}
          </div>
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">2.000+</span> Nutzer vertrauen Legal Buddy
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative"
      >
        <div className="aspect-square rounded-3xl border border-white/20 relative bg-gradient-to-br from-slate-800/70 to-slate-900 overflow-hidden shadow-2xl shadow-blue-500/15">
          {/* Inner glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/25 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none" />

          {/* App UI Mockup */}
          <div className="absolute inset-0 p-6 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1 pb-3 border-b border-white/8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Scale className="text-white w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">Mieterhöhung analysieren</div>
                <div className="text-[10px] text-slate-500">Fall #2847 · Aktiv</div>
              </div>
              <div className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/20 flex-shrink-0">
                Live
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col gap-2.5 flex-grow overflow-hidden">
              <div className="self-end max-w-[82%] bg-blue-600/30 border border-blue-500/30 rounded-2xl rounded-tr-sm px-3 py-2">
                <p className="text-[11px] text-white leading-relaxed">Vermieter will Miete um 15% erhöhen. Was kann ich tun?</p>
              </div>
              <div className="self-start max-w-[88%] bg-white/10 border border-white/15 rounded-2xl rounded-tl-sm px-3 py-2">
                <p className="text-[11px] text-slate-200 leading-relaxed">Ich analysiere Ihren Fall. Eine Erhöhung von 15% ist an klare Voraussetzungen geknüpft...</p>
              </div>

              {/* Analysis card */}
              <div className="bg-white/8 border border-white/15 rounded-xl p-3 mt-0.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <FileCheck className="text-blue-400 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-white">Rechtliche Einschätzung</span>
                  <div className="ml-auto text-[10px] font-bold text-emerald-400">85% Chance</div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { color: 'bg-emerald-400', text: 'Widerspruchsfrist: 2 Monate' },
                    { color: 'bg-blue-400',    text: 'Vergleichsmiete prüfbar' },
                    { color: 'bg-violet-400',  text: 'Musterbrief verfügbar' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 ${item.color} rounded-full flex-shrink-0`} />
                      <span className="text-[10px] text-slate-400">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-3 py-2 mt-auto">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-[10px] text-slate-500 flex-1">Legal Buddy analysiert...</span>
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="text-white w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 -right-3 bg-white/8 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/15"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Check className="text-emerald-400 w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-white">Musterbrief fertig</div>
                <div className="text-[9px] text-slate-500">Zum Versenden bereit</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => (
  <section id="how-it-works" className="py-24 px-6 bg-[#05050a] border-t border-white/5">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-xl mb-14">
        <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">So funktioniert's</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">In 3 Schritten zu deinem Recht</h2>
        <p className="text-slate-400 leading-relaxed">Kein Jurastudium nötig. Wir führen dich durch den gesamten Prozess.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { num: '01', icon: <MessageSquare className="w-5 h-5 text-blue-400" />, title: 'Schildere dein Anliegen', desc: 'Erzähl uns in deinen eigenen Worten, was passiert ist. Unsere AI stellt die richtigen Fragen.' },
          { num: '02', icon: <FileCheck className="w-5 h-5 text-violet-400" />, title: 'Erhalte eine Ersteinschätzung', desc: 'Innerhalb von Minuten erhältst du eine verständliche Analyse deiner Rechtslage.' },
          { num: '03', icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'Wir handeln für dich', desc: 'Vom Widerspruchsschreiben bis zur Anwaltsempfehlung – wir begleiten dich.' },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 p-8 rounded-2xl border border-white/8 hover:border-white/15 hover:bg-white/8 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <span className="text-3xl font-bold text-white/8">{f.num}</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Rechtsgebiete = () => {
  const areas = [
    {
      icon: Scale,
      title: 'Verbraucherrecht',
      desc: 'Abo-Falle, mangelhaftes Produkt oder unlautere AGB? Wir helfen dir, dein Geld zurückzubekommen.',
      tags: ['Widerruf', 'Gewährleistung', 'Online-Kauf'],
      color: 'blue',
      active: true,
    },
    {
      icon: FileCheck,
      title: 'Vertragscheck',
      desc: 'Bevor du unterschreibst – lass Legal Buddy deinen Vertrag analysieren und Risiken aufzeigen.',
      tags: ['Mietvertrag', 'Arbeitsvertrag', 'AGB-Check'],
      color: 'violet',
      active: true,
    },
    {
      icon: Shield,
      title: 'Mietrecht',
      desc: 'Nebenkostenabrechnung, Mieterhöhung, Kündigung – demnächst bei Legal Buddy.',
      tags: ['Nebenkosten', 'Mieterhöhung', 'Kündigung'],
      color: 'slate',
      active: false,
    },
    {
      icon: MessageSquare,
      title: 'Arbeitsrecht',
      desc: 'Kündigung erhalten oder Abfindung verhandeln? Kommt bald zu Legal Buddy.',
      tags: ['Kündigung', 'Abfindung', 'Zeugnis'],
      color: 'slate',
      active: false,
    },
  ];

  const colorMap: Record<string, { icon: string; tag: string; tagText: string; border: string; glow: string }> = {
    blue: {
      icon: 'bg-blue-500/15 text-blue-400',
      tag: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      tagText: 'text-blue-300',
      border: 'border-blue-500/20',
      glow: 'hover:border-blue-500/30',
    },
    violet: {
      icon: 'bg-violet-500/15 text-violet-400',
      tag: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
      tagText: 'text-violet-300',
      border: 'border-violet-500/20',
      glow: 'hover:border-violet-500/30',
    },
    slate: {
      icon: 'bg-white/5 text-slate-500',
      tag: 'bg-white/5 border-white/8 text-slate-600',
      tagText: 'text-slate-600',
      border: 'border-white/5',
      glow: '',
    },
  };

  return (
    <section id="rechtsgebiete" className="py-24 px-6 bg-[#080810] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-4">
          <div>
            <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-3">Rechtsgebiete</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Wobei können wir helfen?</h2>
          </div>
          <p className="text-sm text-slate-400 md:max-w-xs md:text-right">Zwei Bereiche aktiv — weitere folgen.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {areas.map((area, i) => {
            const c = colorMap[area.color];
            const Icon = area.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'p-8 rounded-2xl border transition-all relative group',
                  area.active
                    ? cn('bg-white/5 hover:bg-white/7', c.border, c.glow)
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                )}
              >
                {!area.active && (
                  <span className="absolute top-6 right-6 px-2.5 py-1 bg-white/5 text-slate-600 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/8">
                    Bald verfügbar
                  </span>
                )}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-5', c.icon)}>
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{area.title}</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{area.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {area.tags.map(tag => (
                    <span key={tag} className={cn('px-3 py-1 rounded-full text-xs font-medium border', c.tag)}>
                      {tag}
                    </span>
                  ))}
                </div>
                {area.active && (
                  <a href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors group-hover:text-white/80">
                    Jetzt starten <ArrowRight size={13} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const comparisonRows = [
    { label: 'Kosten pro Anliegen', legal: 'ab 29 €', anwalt: '190–600 €', win: 'legal' },
    { label: 'Verfügbarkeit', legal: '24/7, sofort', anwalt: 'Mo–Fr, Bürozeiten', win: 'legal' },
    { label: 'Wartezeit auf Antwort', legal: '< 2 Minuten', anwalt: '1–4 Wochen', win: 'legal' },
    { label: 'Dokumentvorlagen', legal: 'Inklusive', anwalt: 'Extra berechnet', win: 'legal' },
    { label: 'Musterbrief / Schreiben', legal: 'Automatisch erstellt', anwalt: 'Auf Anfrage, kostenpflichtig', win: 'legal' },
    { label: 'Komplexe Verfahren', legal: 'Anwaltsvermittlung', anwalt: 'Vollständige Vertretung', win: 'anwalt' },
  ];

  const packages = [
    {
      count: 1, label: 'Einzel-Fall', price: '29', pricePerCase: '29,00',
      validity: '6 Monate gültig', saving: null, popular: false,
      features: ['KI-Ersteinschätzung', 'Musterbrief inklusive', 'Schritt-für-Schritt-Plan', 'Anwaltlich geprüft'],
    },
    {
      count: 3, label: '3er-Paket', price: '69', pricePerCase: '23,00',
      validity: '12 Monate gültig', saving: '18 € gespart', popular: true,
      features: ['Alles aus Einzel-Fall', 'Vertragscheck (bis 5 S.)', 'Priorität in der Queue', '12 Monate gültig'],
    },
    {
      count: 10, label: '10er-Paket', price: '199', pricePerCase: '19,90',
      validity: '24 Monate gültig', saving: '91 € gespart', popular: false,
      features: ['Alles aus 3er-Paket', 'Vertragscheck (bis 20 S.)', 'Prioritäts-Support', '24 Monate gültig'],
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">Preise</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Recht bekommen — ohne Anwaltsrechnung
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Bezahle nur für das, was du wirklich brauchst. Kein Abo, keine Mindestlaufzeit, keine versteckten Kosten.
          </p>
        </div>

        {/* Visual price comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 mb-5"
        >
          <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.03] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-[50px]" />
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-6">Herkömmliche Rechtsberatung</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white/25">190–600 €</span>
              <p className="text-slate-600 text-sm mt-2">pro Erstberatung beim Anwalt</p>
            </div>
            <div className="space-y-3">
              {['Wartezeit bis zu 4 Wochen', 'Nur während Bürozeiten erreichbar', 'Musterbrief extra berechnet'].map(t => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <X className="w-3.5 h-3.5 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[70px]" />
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-6">Legal Buddy</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">ab 29 €</span>
              <p className="text-slate-400 text-sm mt-2">pro Fall — alles inklusive</p>
            </div>
            <div className="space-y-3">
              {['Sofortige Antwort, 24/7 verfügbar', 'Musterbrief automatisch erstellt', 'Anwaltlich geprüft & verantwortet'].map(t => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Equivalence hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/8 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Für den Preis einer Anwalts-Erstberatung bekommst du bis zu <strong className="text-white">20 Fälle</strong> bei Legal Buddy</span>
          </div>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden mb-16"
        >
          <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/8">
            <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Kriterium</div>
            <div className="px-6 py-4 text-xs font-semibold text-blue-400 uppercase tracking-widest border-l border-white/8 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5" /> Legal Buddy
            </div>
            <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-l border-white/8">
              Anwaltskanzlei
            </div>
          </div>
          {comparisonRows.map((row, i) => (
            <div key={i} className={cn('grid grid-cols-3', i < comparisonRows.length - 1 && 'border-b border-white/5')}>
              <div className="px-6 py-4 text-sm text-slate-400">{row.label}</div>
              <div className={cn('px-6 py-4 text-sm font-medium border-l border-white/8 flex items-center gap-1.5', row.win === 'legal' ? 'text-blue-400' : 'text-slate-500')}>
                {row.win === 'legal' && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                {row.legal}
              </div>
              <div className={cn('px-6 py-4 text-sm border-l border-white/8', row.win === 'anwalt' ? 'text-slate-300' : 'text-slate-600')}>
                {row.anwalt}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Packages header */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-1.5">Wähle dein Paket</h3>
          <p className="text-sm text-slate-500">Fälle kaufen, wann du sie brauchst. Keine monatliche Abrechnung.</p>
        </div>

        {/* Package cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'p-8 rounded-2xl border flex flex-col relative',
                pkg.popular
                  ? 'bg-gradient-to-b from-blue-600/20 to-violet-600/10 border-blue-500/30 shadow-xl shadow-blue-500/10'
                  : 'bg-white/5 border-white/8'
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Beliebteste Wahl
                  </span>
                </div>
              )}
              {pkg.saving && (
                <span className="absolute top-6 right-6 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold rounded-full border border-emerald-500/20">
                  {pkg.saving}
                </span>
              )}
              <p className="text-sm font-semibold text-slate-400 mb-1">{pkg.label}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-white">{pkg.price} €</span>
              </div>
              <p className="text-xs text-slate-500 mb-8">{pkg.pricePerCase} € pro Fall · {pkg.validity}</p>
              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className={cn('w-4 h-4 flex-shrink-0', pkg.popular ? 'text-blue-400' : 'text-slate-500')} />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={cn(
                  'w-full py-3 rounded-full font-semibold text-center text-sm transition-all',
                  pkg.popular
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                    : 'bg-white/8 text-white hover:bg-white/12 border border-white/10'
                )}
              >
                {pkg.count === 1 ? 'Jetzt loslegen' : `${pkg.count} Fälle kaufen`}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Alle Preise inkl. MwSt. · Sichere Zahlung via Stripe · Fälle verfallen nicht vor Ablauf der Gültigkeitsdauer
        </p>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { q: 'Ist Legal Buddy ein Anwalt?', a: 'Legal Buddy wird von einer zugelassenen Rechtsanwaltskanzlei betrieben. Die AI-gestützte Ersteinschätzung wird anwaltlich verantwortet. Bei Bedarf vermitteln wir dich an spezialisierte Anwälte.' },
    { q: 'Wie genau ist die AI-Analyse?', a: 'Unsere AI wird kontinuierlich an aktueller Rechtsprechung trainiert und von Anwälten überwacht. Jede Analyse enthält einen Confidence-Score. Bei Unsicherheit empfehlen wir eine anwaltliche Prüfung.' },
    { q: 'Kann ich Legal Buddy jederzeit kündigen?', a: 'Ja, monatlich kündbar. Keine Mindestlaufzeit. Keine versteckten Kosten.' },
  ];
  return (
    <section className="py-24 px-6 bg-[#080810] border-t border-white/5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Häufige Fragen</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/8 rounded-xl overflow-hidden bg-white/3">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                {faq.q}
                <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ml-4', openIndex === i && 'rotate-180')} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-6 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
    <div className="max-w-2xl mx-auto text-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Bereit, dein{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Recht durchzusetzen?
          </span>
        </h2>
        <p className="text-slate-400 mb-10 text-lg leading-relaxed">
          Schließ dich tausenden Nutzern an, die mit Legal Buddy ihre Rechtsprobleme gelöst haben. Die erste Einschätzung ist kostenlos.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-4 rounded-full font-semibold text-base hover:opacity-90 transition-opacity shadow-2xl shadow-blue-500/25 group"
        >
          Kostenlos starten
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black border-t border-white/5 text-white py-16 px-6">
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <Link to="/" className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Scale className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-white">Legal Buddy</span>
        </Link>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          AI-gestützter Rechtsassistent für Deutschland. Recht – verständlich, bezahlbar, sofort.
        </p>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-5">Produkt</h4>
        <ul className="space-y-3 text-sm text-slate-500">
          <li><a href="#how-it-works" className="hover:text-white transition-colors">So funktioniert's</a></li>
          <li><a href="#rechtsgebiete" className="hover:text-white transition-colors">Rechtsgebiete</a></li>
          <li><a href="#pricing" className="hover:text-white transition-colors">Preise</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-5">Rechtliches</h4>
        <ul className="space-y-3 text-sm text-slate-500">
          <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
          <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
      <span>© 2026 Legal Buddy Rechtsanwaltsgesellschaft mbH. Alle Rechte vorbehalten.</span>
      <div className="flex gap-4">
        <span>DSGVO-konform</span>
        <span>Made in Germany</span>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-[#05050a]">
      <Nav />
      <Hero />
      <Features />
      <Rechtsgebiete />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
