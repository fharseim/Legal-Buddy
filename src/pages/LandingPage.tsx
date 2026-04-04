import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center">
            <Scale className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1a1a2e]">Legal Buddy</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e]">So funktioniert's</a>
          <a href="#rechtsgebiete" className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e]">Rechtsgebiete</a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e]">Preise</a>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e]">Login</Link>
          <Link to="/register" className="bg-[#2d6a4f] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#1b4332] transition-colors shadow-lg shadow-green-900/10">
            Kostenlos starten
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b p-6 flex flex-col gap-4 md:hidden"
        >
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>So funktioniert's</a>
          <a href="#rechtsgebiete" onClick={() => setIsMenuOpen(false)}>Rechtsgebiete</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Preise</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="bg-[#2d6a4f] text-white px-6 py-3 rounded-xl text-center font-semibold">
            Kostenlos starten
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="pt-32 pb-20 px-6 bg-[#fafaf8]">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-[#2d6a4f] rounded-full text-xs font-bold mb-6 border border-green-100">
          <Shield className="w-3.5 h-3.5" />
          AI-GESTÜTZT & ANWALTLICH GEPRÜFT
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-[#1a1a2e] leading-[1.1] mb-6">
          Dein Recht. <br />
          <span className="text-gray-400">Verständlich.</span> <br />
          <span className="text-[#2d6a4f]">Bezahlbar. Sofort.</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
          Legal Buddy ist dein AI-gestützter Rechtsassistent – für Mietrecht, Verbraucherrecht, Arbeitsrecht und mehr. Ohne Anwaltskanzlei, ohne Wartezeit, ohne Kostenrisiko.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="bg-[#2d6a4f] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#1b4332] transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 group">
            Jetzt kostenlos starten
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#how-it-works" className="px-8 py-4 rounded-full text-lg font-semibold text-[#1a1a2e] hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
            So funktioniert's
          </a>
        </div>
        <div className="mt-12 flex items-center gap-8 opacity-50 grayscale">
          <span className="text-xs font-bold uppercase tracking-widest">DSGVO-KONFORM</span>
          <span className="text-xs font-bold uppercase tracking-widest">MADE IN GERMANY</span>
          <span className="text-xs font-bold uppercase tracking-widest">ANWALTLICH GEPRÜFT</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-50 rounded-[40px] overflow-hidden shadow-2xl relative">
          <img 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000" 
            alt="Legal Buddy" 
            className="w-full h-full object-cover mix-blend-multiply opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/40 to-transparent" />
          
          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-w-[200px]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="text-[#2d6a4f] w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#1a1a2e]">Analyse fertig</span>
            </div>
            <p className="text-[10px] text-gray-500">Deine Chancen auf Rückerstattung stehen bei 85%.</p>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-w-[220px]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileCheck className="text-blue-600 w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#1a1a2e]">Dokument erstellt</span>
            </div>
            <p className="text-[10px] text-gray-500">Widerrufsschreiben für deinen Online-Kauf ist bereit.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => (
  <section id="how-it-works" className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] mb-6">In 3 Schritten zu deinem Recht</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Wir haben den Prozess so einfach wie möglich gestaltet. Du brauchst kein Jurastudium, um dich zu wehren.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-12">
        {[
          {
            icon: <MessageSquare className="w-8 h-8 text-[#2d6a4f]" />,
            title: "Schildere dein Anliegen",
            desc: "Erzähl uns in deinen eigenen Worten, was passiert ist. Unsere AI stellt die richtigen Fragen."
          },
          {
            icon: <FileCheck className="w-8 h-8 text-[#2d6a4f]" />,
            title: "Erhalte eine Ersteinschätzung",
            desc: "Innerhalb von Minuten erhältst du eine verständliche Analyse deiner Rechtslage."
          },
          {
            icon: <Shield className="w-8 h-8 text-[#2d6a4f]" />,
            title: "Wir handeln für dich",
            desc: "Vom Widerspruchsschreiben bis zur Anwaltsempfehlung – wir begleiten dich."
          }
        ].map((f, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-[#fafaf8] border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">{f.title}</h3>
            <p className="text-gray-600 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Rechtsgebiete = () => (
  <section id="rechtsgebiete" className="py-24 px-6 bg-[#fafaf8]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] mb-6">Wobei kann Legal Buddy helfen?</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          {
            title: "Verbraucherrecht",
            desc: "Abo-Falle? Mangelhaftes Produkt? Wir helfen dir, dein Geld zurückzubekommen.",
            tags: ["Widerruf", "Gewährleistung", "Online-Kauf"],
            active: true
          },
          {
            title: "Vertragscheck",
            desc: "Bevor du unterschreibst – lass Legal Buddy deinen Vertrag prüfen.",
            tags: ["Mietvertrag", "Arbeitsvertrag", "AGB-Check"],
            active: true
          },
          {
            title: "Mietrecht",
            desc: "Nebenkostenabrechnung, Mieterhöhung, Kündigung – bald verfügbar.",
            tags: ["Nebenkosten", "Mieterhöhung", "Kündigung"],
            active: false
          },
          {
            title: "Arbeitsrecht",
            desc: "Kündigung erhalten? Abfindung verhandeln? Bald bei Legal Buddy.",
            tags: ["Kündigung", "Abfindung", "Zeugnis"],
            active: false
          }
        ].map((area, i) => (
          <div key={i} className={cn(
            "p-10 rounded-[32px] border transition-all group relative overflow-hidden",
            area.active ? "bg-white border-gray-100 hover:shadow-xl" : "bg-gray-50 border-gray-200 opacity-80"
          )}>
            {!area.active && (
              <div className="absolute top-6 right-6 px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Coming Soon
              </div>
            )}
            <h3 className="text-2xl font-bold text-[#1a1a2e] mb-4">{area.title}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{area.desc}</p>
            <div className="flex flex-wrap gap-2">
              {area.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
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
  <section id="pricing" className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] mb-6">Transparente Preise</h2>
        <p className="text-gray-500">Keine versteckten Kosten. Keine Mindestlaufzeit.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            name: "Buddy",
            price: "19,90",
            features: ["3 Rechtsanliegen / Monat", "AI-Ersteinschätzung", "Dokumentenvorlagen", "E-Mail-Support"],
            recommended: false
          },
          {
            name: "Pro",
            price: "39,90",
            features: ["Unbegrenzte Anliegen", "Vertragscheck (bis 20 S.)", "Priorisierter AI-Assistent", "Anwalts-Hotline (30 Min)"],
            recommended: true
          },
          {
            name: "Familie",
            price: "49,90",
            features: ["Alles aus Pro", "Bis zu 4 Personen", "Familienrecht-Vorlagen", "Gemeinsames Dashboard"],
            recommended: false
          }
        ].map((plan, i) => (
          <div key={i} className={cn(
            "p-10 rounded-[40px] border flex flex-col",
            plan.recommended ? "bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-2xl scale-105 z-10" : "bg-white border-gray-100"
          )}>
            {plan.recommended && (
              <div className="bg-[#2d6a4f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full self-start mb-6">
                Empfohlen
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold">{plan.price}€</span>
              <span className={cn("text-sm", plan.recommended ? "text-gray-400" : "text-gray-500")}>/Monat</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className={cn("w-5 h-5", plan.recommended ? "text-[#2d6a4f]" : "text-[#2d6a4f]")} />
                  {f}
                </li>
              ))}
            </ul>
            <Link 
              to="/register" 
              className={cn(
                "w-full py-4 rounded-full font-bold text-center transition-all",
                plan.recommended ? "bg-[#2d6a4f] text-white hover:bg-[#1b4332]" : "bg-[#1a1a2e] text-white hover:bg-black"
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
    {
      q: "Ist Legal Buddy ein Anwalt?",
      a: "Legal Buddy wird von einer zugelassenen Rechtsanwaltskanzlei betrieben. Die AI-gestützte Ersteinschätzung wird anwaltlich verantwortet. Bei Bedarf vermitteln wir dich an spezialisierte Anwälte."
    },
    {
      q: "Wie genau ist die AI-Analyse?",
      a: "Unsere AI wird kontinuierlich an aktueller Rechtsprechung trainiert und von Anwälten überwacht. Jede Analyse enthält einen Confidence-Score. Bei Unsicherheit empfehlen wir eine anwaltliche Prüfung."
    },
    {
      q: "Kann ich Legal Buddy jederzeit kündigen?",
      a: "Ja, monatlich kündbar. Keine Mindestlaufzeit. Keine versteckten Kosten."
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#fafaf8]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a2e] text-center mb-16">Häufig gestellte Fragen</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-[#1a1a2e]"
              >
                {faq.q}
                <ChevronDown className={cn("w-5 h-5 transition-transform", openIndex === i && "rotate-180")} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
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
  <footer className="bg-[#1a1a2e] text-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Scale className="text-[#2d6a4f] w-8 h-8" />
          <span className="text-2xl font-bold">Legal Buddy</span>
        </Link>
        <p className="text-gray-400 max-w-sm mb-8">
          Legal Buddy ist dein AI-gestützter Rechtsassistent. Wir machen Recht für jeden zugänglich, verständlich und bezahlbar.
        </p>
        <div className="flex gap-4">
          {/* Social Icons Placeholder */}
          <div className="w-10 h-10 bg-white/5 rounded-full" />
          <div className="w-10 h-10 bg-white/5 rounded-full" />
          <div className="w-10 h-10 bg-white/5 rounded-full" />
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-6">Produkt</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><a href="#how-it-works" className="hover:text-white">So funktioniert's</a></li>
          <li><a href="#rechtsgebiete" className="hover:text-white">Rechtsgebiete</a></li>
          <li><a href="#pricing" className="hover:text-white">Preise</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6">Rechtliches</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><a href="#" className="hover:text-white">Impressum</a></li>
          <li><a href="#" className="hover:text-white">Datenschutz</a></li>
          <li><a href="#" className="hover:text-white">AGB</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
      © 2026 Legal Buddy Rechtsanwaltsgesellschaft mbH. Alle Rechte vorbehalten.
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-[#1a1a2e]">
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
