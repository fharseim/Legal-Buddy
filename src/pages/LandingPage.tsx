import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Scale, FileCheck, MessageSquare, ChevronDown, Check, ArrowRight, Menu, X } from 'lucide-react';
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
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
      isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-100' : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="text-white w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-900">Legal Buddy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">So funktioniert's</a>
          <a href="#rechtsgebiete" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Rechtsgebiete</a>
          <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Preise</a>
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
            Kostenlos starten
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 md:hidden"
        >
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-700">So funktioniert's</a>
          <a href="#rechtsgebiete" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-700">Rechtsgebiete</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm text-slate-700">Preise</a>
          <Link to="/login" className="text-sm text-slate-700">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-center text-sm font-semibold">
            Kostenlos starten
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="pt-32 pb-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-8 border border-blue-100">
          <Shield className="w-3.5 h-3.5" />
          AI-gestützt & anwaltlich geprüft
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
          Dein Recht.<br />
          <span className="text-slate-300">Verständlich.</span><br />
          <span className="text-blue-600">Sofort.</span>
        </h1>

        <p className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
          Dein AI-Rechtsassistent für Mietrecht, Verbraucherrecht und Arbeitsrecht. Ohne Anwaltskanzlei, ohne Wartezeit.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/register" className="bg-slate-900 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 group">
            Jetzt kostenlos starten
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#how-it-works" className="px-7 py-3.5 rounded-full font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors flex items-center justify-center">
            So funktioniert's
          </a>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['bg-blue-200', 'bg-violet-200', 'bg-emerald-200', 'bg-orange-200'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white`} />
            ))}
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">2.000+</span> Nutzer vertrauen Legal Buddy
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative"
      >
        <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000"
            alt="Legal Buddy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 -left-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 max-w-[190px]"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Check className="text-emerald-600 w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Analyse fertig</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Rückerstattungschance: 85 %</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-8 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 max-w-[210px]"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileCheck className="text-blue-600 w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Dokument erstellt</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Widerrufsschreiben ist bereit.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => (
  <section id="how-it-works" className="py-24 px-6 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-xl mb-14">
        <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">So funktioniert's</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">In 3 Schritten zu deinem Recht</h2>
        <p className="text-slate-500 leading-relaxed">Kein Jurastudium nötig. Wir führen dich durch den gesamten Prozess.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { num: '01', icon: <MessageSquare className="w-5 h-5 text-blue-600" />, title: 'Schildere dein Anliegen', desc: 'Erzähl uns in deinen eigenen Worten, was passiert ist. Unsere AI stellt die richtigen Fragen.' },
          { num: '02', icon: <FileCheck className="w-5 h-5 text-blue-600" />, title: 'Erhalte eine Ersteinschätzung', desc: 'Innerhalb von Minuten erhältst du eine verständliche Analyse deiner Rechtslage.' },
          { num: '03', icon: <Shield className="w-5 h-5 text-blue-600" />, title: 'Wir handeln für dich', desc: 'Vom Widerspruchsschreiben bis zur Anwaltsempfehlung – wir begleiten dich.' },
        ].map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <span className="text-3xl font-bold text-slate-100">{f.num}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Rechtsgebiete = () => (
  <section id="rechtsgebiete" className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-xl mb-14">
        <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">Rechtsgebiete</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Wobei können wir helfen?</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Verbraucherrecht', desc: 'Abo-Falle? Mangelhaftes Produkt? Wir helfen dir, dein Geld zurückzubekommen.', tags: ['Widerruf', 'Gewährleistung', 'Online-Kauf'], active: true },
          { title: 'Vertragscheck', desc: 'Bevor du unterschreibst – lass Legal Buddy deinen Vertrag prüfen.', tags: ['Mietvertrag', 'Arbeitsvertrag', 'AGB-Check'], active: true },
          { title: 'Mietrecht', desc: 'Nebenkostenabrechnung, Mieterhöhung, Kündigung – bald verfügbar.', tags: ['Nebenkosten', 'Mieterhöhung', 'Kündigung'], active: false },
          { title: 'Arbeitsrecht', desc: 'Kündigung erhalten? Abfindung verhandeln? Bald bei Legal Buddy.', tags: ['Kündigung', 'Abfindung', 'Zeugnis'], active: false },
        ].map((area, i) => (
          <div key={i} className={cn(
            'p-8 rounded-2xl border transition-all relative',
            area.active ? 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm' : 'bg-slate-50 border-slate-100'
          )}>
            {!area.active && (
              <span className="absolute top-6 right-6 px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                Bald verfügbar
              </span>
            )}
            <h3 className="text-base font-semibold text-slate-900 mb-2">{area.title}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{area.desc}</p>
            <div className="flex flex-wrap gap-2">
              {area.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-24 px-6 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-xl mb-14">
        <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">Preise</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Transparente Preise</h2>
        <p className="text-slate-500">Keine versteckten Kosten. Keine Mindestlaufzeit. 14 Tage kostenlos testen.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Buddy', price: '19,90', features: ['3 Rechtsanliegen / Monat', 'AI-Ersteinschätzung', 'Dokumentenvorlagen', 'E-Mail-Support'], recommended: false },
          { name: 'Pro', price: '39,90', features: ['Unbegrenzte Anliegen', 'Vertragscheck (bis 20 S.)', 'Priorisierter AI-Assistent', 'Anwalts-Hotline (30 Min)'], recommended: true },
          { name: 'Familie', price: '49,90', features: ['Alles aus Pro', 'Bis zu 4 Personen', 'Familienrecht-Vorlagen', 'Gemeinsames Dashboard'], recommended: false },
        ].map((plan, i) => (
          <div key={i} className={cn(
            'p-8 rounded-2xl border flex flex-col relative',
            plan.recommended ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100'
          )}>
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Empfohlen
                </span>
              </div>
            )}
            <h3 className="text-sm font-semibold mb-1 opacity-60">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-3xl font-bold">{plan.price}€</span>
              <span className="text-sm text-slate-400">/Monat</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className={cn('w-4 h-4 flex-shrink-0', plan.recommended ? 'text-blue-400' : 'text-blue-600')} />
                  <span className={plan.recommended ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={cn(
                'w-full py-3 rounded-full font-semibold text-center text-sm transition-colors',
                plan.recommended ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-white hover:bg-black'
              )}
            >
              Jetzt starten
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { q: 'Ist Legal Buddy ein Anwalt?', a: 'Legal Buddy wird von einer zugelassenen Rechtsanwaltskanzlei betrieben. Die AI-gestützte Ersteinschätzung wird anwaltlich verantwortet. Bei Bedarf vermitteln wir dich an spezialisierte Anwälte.' },
    { q: 'Wie genau ist die AI-Analyse?', a: 'Unsere AI wird kontinuierlich an aktueller Rechtsprechung trainiert und von Anwälten überwacht. Jede Analyse enthält einen Confidence-Score. Bei Unsicherheit empfehlen wir eine anwaltliche Prüfung.' },
    { q: 'Kann ich Legal Buddy jederzeit kündigen?', a: 'Ja, monatlich kündbar. Keine Mindestlaufzeit. Keine versteckten Kosten.' },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Häufige Fragen</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {faq.q}
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-4', openIndex === i && 'rotate-180')} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
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

const Footer = () => (
  <footer className="bg-slate-900 text-white py-16 px-6">
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <Link to="/" className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-white">Legal Buddy</span>
        </Link>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          AI-gestützter Rechtsassistent für Deutschland. Recht – verständlich, bezahlbar, sofort.
        </p>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Produkt</h4>
        <ul className="space-y-3 text-sm text-slate-400">
          <li><a href="#how-it-works" className="hover:text-white transition-colors">So funktioniert's</a></li>
          <li><a href="#rechtsgebiete" className="hover:text-white transition-colors">Rechtsgebiete</a></li>
          <li><a href="#pricing" className="hover:text-white transition-colors">Preise</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Rechtliches</h4>
        <ul className="space-y-3 text-sm text-slate-400">
          <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
          <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
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
    <div className="min-h-screen font-sans">
      <Nav />
      <Hero />
      <Features />
      <Rechtsgebiete />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
