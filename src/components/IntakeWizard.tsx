import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

interface ChoiceOption { value: string; label: string; emoji?: string; }
interface BaseQuestion { id: string; text: string; subtitle?: string; required?: boolean; condition?: (answers: Answers) => boolean; }
interface ChoiceQuestion extends BaseQuestion { type: 'choice'; options: ChoiceOption[]; }
interface MultiChoiceQuestion extends BaseQuestion { type: 'multichoice'; options: ChoiceOption[]; minSelect?: number; maxSelect?: number; }
interface TextQuestion extends BaseQuestion { type: 'text'; placeholder?: string; multiline?: boolean; }
interface DateQuestion extends BaseQuestion { type: 'date'; }
export type Question = ChoiceQuestion | MultiChoiceQuestion | TextQuestion | DateQuestion;

const CATEGORY_QUESTIONS: Record<string, Question[]> = {
  mietrecht: [
    { id: 'situation', type: 'choice', text: 'Was ist passiert?', subtitle: 'Wählen Sie die Situation, die am besten auf Ihren Fall zutrifft.', options: [ { emoji: '📮', value: 'kuendigung', label: 'Kündigung durch Vermieter' }, { emoji: '💰', value: 'mieterhoehung', label: 'Mieterhöhung' }, { emoji: '🔧', value: 'maengel', label: 'Mängel oder Schäden' }, { emoji: '💼', value: 'kaution', label: 'Kautionsstreit' }, { emoji: '🏠', value: 'eigenbedarf', label: 'Eigenbedarf angemeldet' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Mietproblem' } ] },
    { id: 'schriftlich', type: 'choice', text: 'Haben Sie eine schriftliche Kündigung erhalten?', condition: a => a['situation'] === 'kuendigung' || a['situation'] === 'eigenbedarf', options: [ { emoji: '✅', value: 'ja', label: 'Ja, schriftlich' }, { emoji: '🗣️', value: 'muendlich', label: 'Nur mündlich' }, { emoji: '⏳', value: 'nein', label: 'Noch nicht, wurde aber angekündigt' } ] },
    { id: 'datum_kuendigung', type: 'date', text: 'Wann wurde die Kündigung ausgesprochen?', condition: a => ['kuendigung', 'eigenbedarf'].includes(a['situation'] as string) },
    { id: 'wohndauer', type: 'choice', text: 'Wie lange wohnen Sie schon in der Wohnung?', options: [ { value: 'lt1', label: 'Weniger als 1 Jahr' }, { value: '1_3', label: '1 bis 3 Jahre' }, { value: '3_5', label: '3 bis 5 Jahre' }, { value: 'gt5', label: 'Mehr als 5 Jahre' } ] },
    { id: 'miete_gezahlt', type: 'choice', text: 'Haben Sie die Miete immer pünktlich gezahlt?', options: [ { emoji: '✅', value: 'ja', label: 'Ja, immer pünktlich' }, { emoji: '⚠️', value: 'meistens', label: 'Meistens, gelegentlich verspätet' }, { emoji: '❌', value: 'rueckstaende', label: 'Es gab Rückstände' } ] },
    { id: 'mietvertrag', type: 'choice', text: 'Gibt es einen schriftlichen Mietvertrag?', options: [ { emoji: '📄', value: 'ja', label: 'Ja' }, { emoji: '🤝', value: 'muendlich', label: 'Nur mündlich vereinbart' }, { emoji: '❓', value: 'unbekannt', label: 'Nicht sicher' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie erreichen?', options: [ { emoji: '⚖️', value: 'anfechten', label: 'Kündigung anfechten' }, { emoji: '🤝', value: 'vergleich', label: 'Vergleich oder Lösung aushandeln' }, { emoji: '💡', value: 'rat', label: 'Ersteinschätzung und Optionen kennen' }, { emoji: '📦', value: 'umzug', label: 'Geordnet ausziehen und Rechte wahren' } ] },
    { id: 'zusatz', type: 'text', text: 'Gibt es noch etwas Wichtiges zu Ihrem Fall?', subtitle: 'Optional – z.B. besondere Umstände, Vorgeschichte, konkrete Fristen.', placeholder: 'z.B. Der Vermieter behauptet Eigenbedarf, hat aber zuletzt eine andere Wohnung vermietet …', multiline: true, required: false },
  ],
  arbeitsrecht: [
    { id: 'situation', type: 'choice', text: 'Was ist passiert?', options: [ { emoji: '📮', value: 'kuendigung', label: 'Kündigung erhalten' }, { emoji: '⚠️', value: 'abmahnung', label: 'Abmahnung erhalten' }, { emoji: '💶', value: 'lohn', label: 'Lohn- oder Gehaltsstreit' }, { emoji: '🚫', value: 'diskriminierung', label: 'Diskriminierung oder Benachteiligung' }, { emoji: '😰', value: 'mobbing', label: 'Mobbing oder schlechtes Betriebsklima' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Arbeitsproblem' } ] },
    { id: 'beschaeftigung', type: 'choice', text: 'Art des Arbeitsverhältnisses?', options: [ { value: 'vollzeit', label: 'Vollzeit' }, { value: 'teilzeit', label: 'Teilzeit' }, { value: 'minijob', label: 'Minijob / geringfügig' }, { value: 'befristet', label: 'Befristet' }, { value: 'ausbildung', label: 'Ausbildung' } ] },
    { id: 'dauer', type: 'choice', text: 'Wie lange sind oder waren Sie dort beschäftigt?', options: [ { value: 'lt6m', label: 'Weniger als 6 Monate' }, { value: '6m_1j', label: '6 Monate bis 1 Jahr' }, { value: '1_5j', label: '1 bis 5 Jahre' }, { value: 'gt5j', label: 'Mehr als 5 Jahre' } ] },
    { id: 'schriftlich', type: 'choice', text: 'Haben Sie eine schriftliche Kündigung erhalten?', condition: a => a['situation'] === 'kuendigung', options: [ { emoji: '📄', value: 'ja', label: 'Ja, schriftlich' }, { emoji: '🗣️', value: 'muendlich', label: 'Nur mündlich' }, { emoji: '❌', value: 'nein', label: 'Noch nicht' } ] },
    { id: 'grund', type: 'choice', text: 'Hat der Arbeitgeber einen Kündigungsgrund genannt?', condition: a => a['situation'] === 'kuendigung', options: [ { emoji: '✅', value: 'ja_betrieb', label: 'Ja, betriebsbedingt' }, { emoji: '✅', value: 'ja_verhalten', label: 'Ja, verhaltensbedingt' }, { emoji: '✅', value: 'ja_person', label: 'Ja, personenbedingt (z.B. Krankheit)' }, { emoji: '❌', value: 'nein', label: 'Keinen Grund genannt' } ] },
    { id: 'unternehmensgroesse', type: 'choice', text: 'Wie groß ist das Unternehmen?', subtitle: 'Ab 10 Mitarbeitern gilt das Kündigungsschutzgesetz.', options: [ { value: 'lt10', label: 'Weniger als 10 Mitarbeiter' }, { value: '10_50', label: '10 bis 50 Mitarbeiter' }, { value: 'gt50', label: 'Mehr als 50 Mitarbeiter' }, { value: 'unbekannt', label: 'Weiß ich nicht' } ] },
    { id: 'betriebsrat', type: 'choice', text: 'Gibt es einen Betriebsrat?', options: [ { emoji: '✅', value: 'ja', label: 'Ja' }, { emoji: '❌', value: 'nein', label: 'Nein' }, { emoji: '❓', value: 'unbekannt', label: 'Weiß ich nicht' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie erreichen?', options: [ { emoji: '⚖️', value: 'anfechten', label: 'Kündigung anfechten (Kündigungsschutzklage)' }, { emoji: '💶', value: 'abfindung', label: 'Abfindung aushandeln' }, { emoji: '📋', value: 'zeugnis', label: 'Gutes Zeugnis einfordern' }, { emoji: '💡', value: 'rat', label: 'Ersteinschätzung und Optionen kennen' } ] },
    { id: 'zusatz', type: 'text', text: 'Gibt es noch etwas Wichtiges zu Ihrer Situation?', subtitle: 'Optional – z.B. Sonderkündigungsschutz, Schwangerschaft, Schwerbehinderung …', placeholder: 'z.B. Ich bin seit 6 Monaten krankgeschrieben und der Arbeitgeber hat mir trotzdem gekündigt …', multiline: true, required: false },
  ],  vertragsrecht: [
    { id: 'vertragsart', type: 'choice', text: 'Um welche Art von Vertrag oder Geschäft geht es?', options: [ { emoji: '🛒️', value: 'kauf', label: 'Kaufvertrag (Ware)' }, { emoji: '🔧', value: 'dienst', label: 'Dienstleistungsvertrag' }, { emoji: '🏗️', value: 'werk', label: 'Werkvertrag (z.B. Handwerker)' }, { emoji: '📱', value: 'abo', label: 'Abo oder Mitgliedschaft' }, { emoji: '🌐', value: 'online', label: 'Online-Bestellung' }, { emoji: '❓', value: 'sonstiges', label: 'Sonstiger Vertrag' } ] },
    { id: 'problem', type: 'choice', text: 'Was ist das Problem?', options: [ { emoji: '↩️', value: 'ruecktritt', label: 'Ich möchte vom Vertrag zurücktreten' }, { emoji: '🚫', value: 'nicht_erfuellt', label: 'Die andere Partei erfüllt nicht' }, { emoji: '🔍', value: 'maengel', label: 'Versteckte Mängel oder Falschlieferung' }, { emoji: '📜', value: 'agb', label: 'Unklare oder unwirksame Klauseln (AGB)' }, { emoji: '💰', value: 'zahlung', label: 'Zahlungsstreit' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Problem' } ] },
    { id: 'vertrag_vorhanden', type: 'choice', text: 'Gibt es einen schriftlichen Vertrag?', options: [ { emoji: '📄', value: 'ja', label: 'Ja, schriftlicher Vertrag' }, { emoji: '🧾', value: 'rechnung', label: 'Nur Rechnung oder Quittung' }, { emoji: '🤝', value: 'muendlich', label: 'Mündliche Vereinbarung' }, { emoji: '📧', value: 'email', label: 'E-Mail-Kommunikation' } ] },
    { id: 'streitwert', type: 'choice', text: 'Wie hoch ist der ungefähre Streitwert?', subtitle: 'Das beeinflusst, welche rechtlichen Wege sinnvoll sind.', options: [ { value: 'lt200', label: 'Unter 200 €' }, { value: '200_1k', label: '200 € bis 1.000 €' }, { value: '1k_5k', label: '1.000 € bis 5.000 €' }, { value: 'gt5k', label: 'Über 5.000 €' } ] },
    { id: 'kontakt_aufgenommen', type: 'choice', text: 'Haben Sie die Gegenseite bereits kontaktiert?', options: [ { emoji: '✉️', value: 'schriftlich', label: 'Ja, schriftlich – ohne Ergebnis' }, { emoji: '🗣️', value: 'muendlich', label: 'Ja, mündlich – ohne Ergebnis' }, { emoji: '⏳', value: 'warte', label: 'Ja, warte noch auf Antwort' }, { emoji: '❌', value: 'nein', label: 'Noch nicht' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie erreichen?', options: [ { emoji: '↩️', value: 'rueckerstattung', label: 'Rücktritt und Rückerstattung' }, { emoji: '🔧', value: 'nacherfuellung', label: 'Nacherfüllung oder Reparatur' }, { emoji: '💶', value: 'schadensersatz', label: 'Schadensersatz' }, { emoji: '💡', value: 'rat', label: 'Ersteinschätzung und Optionen' } ] },
    { id: 'zusatz', type: 'text', text: 'Weitere Details zu Ihrem Fall?', subtitle: 'Optional – z.B. Fristen, bisherige Korrespondenz, besondere Umstände.', placeholder: 'z.B. Der Handwerker hat die Arbeit nicht fertiggestellt …', multiline: true, required: false },
  ],
  verbraucherrecht: [
    { id: 'situation', type: 'choice', text: 'Was ist passiert?', options: [ { emoji: '📦', value: 'defekt', label: 'Ware ist defekt oder beschädigt' }, { emoji: '🚚', value: 'nicht_geliefert', label: 'Ware wurde nicht geliefert' }, { emoji: '↩️', value: 'widerruf', label: 'Widerruf wurde verweigert' }, { emoji: '⚠️', value: 'falsche_angaben', label: 'Falsche Produktangaben oder Werbung' }, { emoji: '🔄', value: 'abo_falle', label: 'Abo-Falle oder versteckte Kosten' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Problem' } ] },
    { id: 'kaufort', type: 'choice', text: 'Wo haben Sie gekauft?', options: [ { emoji: '🌐', value: 'online', label: 'Online (Amazon, Shop etc.)' }, { emoji: '🏪', value: 'laden', label: 'Im stationären Laden' }, { emoji: '🚶', value: 'haustuer', label: 'Haustürgeschäft oder Vertreter' }, { emoji: '📱', value: 'app', label: 'Per App oder Telefon' } ] },
    { id: 'kaufdatum', type: 'date', text: 'Wann haben Sie gekauft?', subtitle: 'Wichtig für Gewährleistungs- und Widerrufsfristen.' },
    { id: 'kaufpreis', type: 'choice', text: 'Wie viel haben Sie bezahlt?', options: [ { value: 'lt50', label: 'Unter 50 €' }, { value: '50_200', label: '50 € bis 200 €' }, { value: '200_1k', label: '200 € bis 1.000 €' }, { value: 'gt1k', label: 'Mehr als 1.000 €' } ] },
    { id: 'kontakt', type: 'choice', text: 'Haben Sie den Anbieter bereits kontaktiert?', options: [ { emoji: '✉️', value: 'schriftlich_nein', label: 'Ja, schriftlich – kein Ergebnis' }, { emoji: '🗣️', value: 'muendlich_nein', label: 'Ja, mündlich – kein Ergebnis' }, { emoji: '⏳', value: 'warte', label: 'Ja, warte auf Antwort' }, { emoji: '❌', value: 'nein', label: 'Noch nicht kontaktiert' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie erreichen?', options: [ { emoji: '💶', value: 'rueckerstattung', label: 'Vollständige Rückerstattung' }, { emoji: '🔧', value: 'reparatur', label: 'Reparatur oder Ersatz' }, { emoji: '🚫', value: 'kuendigung', label: 'Abo oder Vertrag kündigen' }, { emoji: '💡', value: 'rat', label: 'Ersteinschätzung und nächste Schritte' } ] },
    { id: 'zusatz', type: 'text', text: 'Weitere Angaben zu Ihrem Fall?', placeholder: 'z.B. Ich habe bereits eine Mängelanzeige verschickt …', multiline: true, required: false },
  ],
  familienrecht: [
    { id: 'anliegen', type: 'choice', text: 'Was ist Ihr Anliegen?', options: [ { emoji: '⚖️', value: 'scheidung', label: 'Scheidung einleiten' }, { emoji: '👶', value: 'unterhalt_kind', label: 'Kindesunterhalt klären' }, { emoji: '💰', value: 'unterhalt_partner', label: 'Ehegattenunterhalt' }, { emoji: '🏠', value: 'sorgerecht', label: 'Sorgerecht oder Umgangsrecht' }, { emoji: '💎', value: 'zugewinn', label: 'Vermögensaufteilung / Zugewinn' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Familienrechtsproblem' } ] },
    { id: 'kinder', type: 'choice', text: 'Haben Sie gemeinsame minderjährige Kinder?', options: [ { emoji: '✅', value: 'ja_1', label: 'Ja, 1 Kind' }, { emoji: '✅', value: 'ja_mehrere', label: 'Ja, mehrere Kinder' }, { emoji: '❌', value: 'nein', label: 'Nein' } ] },
    { id: 'ehedauer', type: 'choice', text: 'Wie lange besteht oder bestand die Ehe?', condition: a => ['scheidung', 'unterhalt_partner', 'zugewinn'].includes(a['anliegen'] as string), options: [ { value: 'lt2', label: 'Weniger als 2 Jahre' }, { value: '2_5', label: '2 bis 5 Jahre' }, { value: '5_10', label: '5 bis 10 Jahre' }, { value: 'gt10', label: 'Mehr als 10 Jahre' } ] },
    { id: 'getrennt', type: 'choice', text: 'Leben Sie bereits getrennt?', condition: a => ['scheidung', 'unterhalt_partner', 'sorgerecht'].includes(a['anliegen'] as string), options: [ { emoji: '✅', value: 'ja_lang', label: 'Ja, seit über einem Jahr' }, { emoji: '✅', value: 'ja_kurz', label: 'Ja, weniger als ein Jahr' }, { emoji: '⏳', value: 'bald', label: 'Noch nicht, aber geplant' }, { emoji: '❌', value: 'nein', label: 'Nein' } ] },
    { id: 'einigkeit', type: 'choice', text: 'Wie ist die Situation zwischen Ihnen und Ihrem Partner / Ihrer Partnerin?', options: [ { emoji: '🤝', value: 'einig', label: 'Wir sind weitgehend einig' }, { emoji: '⚖️', value: 'teilweise', label: 'Teilweise uneinig' }, { emoji: '🔥', value: 'streitig', label: 'Sehr streitig, kaum Einigung möglich' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie zunächst?', options: [ { emoji: '💡', value: 'einschaetzung', label: 'Rechtliche Ersteinschätzung' }, { emoji: '📋', value: 'vorbereitung', label: 'Auf Gespräch oder Anwalt vorbereiten' }, { emoji: '⚖️', value: 'klage', label: 'Klage oder gerichtliche Schritte einleiten' }, { emoji: '🤝', value: 'mediation', label: 'Außergerichtliche Einigung anstreben' } ] },
    { id: 'zusatz', type: 'text', text: 'Gibt es besondere Umstände in Ihrem Fall?', placeholder: 'z.B. Haushalt im gemeinsamen Eigentum, laufende Insolvenz …', multiline: true, required: false },
  ],
  verkehrsrecht: [
    { id: 'situation', type: 'choice', text: 'Was ist passiert?', options: [ { emoji: '🚗', value: 'unfall', label: 'Verkehrsunfall' }, { emoji: '📸', value: 'bussgeld', label: 'Bußgeldbescheid erhalten' }, { emoji: '🚦', value: 'fuehrerschein', label: 'Führerscheinproblem (Entzug / MPU)' }, { emoji: '🅿️', value: 'parken', label: 'Falschparken oder Abschleppen' }, { emoji: '🏢', value: 'versicherung', label: 'Streit mit Versicherung' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Verkehrsproblem' } ] },
    { id: 'verletzt', type: 'choice', text: 'Wurden Personen verletzt?', condition: a => a['situation'] === 'unfall', options: [ { emoji: '🏥', value: 'ja_schwer', label: 'Ja, schwer verletzt' }, { emoji: '🩹', value: 'ja_leicht', label: 'Ja, leicht verletzt' }, { emoji: '✅', value: 'nein', label: 'Nein, nur Sachschaden' } ] },
    { id: 'schuld', type: 'choice', text: 'Wer war (überwiegend) schuld am Unfall?', condition: a => a['situation'] === 'unfall', options: [ { value: 'ich', label: 'Ich' }, { value: 'andere', label: 'Die andere Partei' }, { value: 'ungeklaert', label: 'Noch ungeklärt' }, { value: 'geteilt', label: 'Geteilte Schuld' } ] },
    { id: 'promille', type: 'choice', text: 'War Alkohol oder eine andere Substanz im Spiel?', condition: a => ['unfall', 'fuehrerschein', 'bussgeld'].includes(a['situation'] as string), options: [ { emoji: '✅', value: 'nein', label: 'Nein' }, { emoji: '🍺', value: 'alkohol', label: 'Ja, Alkohol' }, { emoji: '💊', value: 'drogen', label: 'Ja, Drogen oder Medikamente' } ] },
    { id: 'polizei', type: 'choice', text: 'Gab es Polizeikontakt oder eine Unfallaufnahme?', options: [ { emoji: '✅', value: 'ja_protokoll', label: 'Ja, mit Protokoll' }, { emoji: '✅', value: 'ja_ohne', label: 'Ja, ohne Protokoll' }, { emoji: '❌', value: 'nein', label: 'Nein' } ] },
    { id: 'zeugen', type: 'choice', text: 'Gibt es Zeugen, Fotos oder Dashcam-Material?', options: [ { emoji: '✅', value: 'ja', label: 'Ja' }, { emoji: '📸', value: 'nur_fotos', label: 'Nur Fotos' }, { emoji: '❌', value: 'nein', label: 'Nein' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie erreichen?', options: [ { emoji: '❌', value: 'einspruch', label: 'Einspruch gegen Bescheid / Bußgeld' }, { emoji: '💶', value: 'schadensersatz', label: 'Schadensersatz durchsetzen' }, { emoji: '🚗', value: 'fuehrerschein', label: 'Führerschein behalten oder zurückbekommen' }, { emoji: '💡', value: 'rat', label: 'Ersteinschätzung und Optionen' } ] },
    { id: 'zusatz', type: 'text', text: 'Weitere Details?', placeholder: 'z.B. Höhe des Bußgelds, Punkte in Flensburg …', multiline: true, required: false },
  ],
  erbrecht: [
    { id: 'anliegen', type: 'choice', text: 'Was ist Ihr Anliegen?', options: [ { emoji: '📜', value: 'erbe_annehmen', label: 'Erbschaft annehmen und regeln' }, { emoji: '🚫', value: 'erbschaft_ausschlagen', label: 'Erbschaft ausschlagen' }, { emoji: '⚖️', value: 'pflichtteil', label: 'Pflichtteil einfordern' }, { emoji: '📋', value: 'testament_anfechten', label: 'Testament anfechten' }, { emoji: '👥', value: 'erbengemeinschaft', label: 'Erbengemeinschaft auflösen' }, { emoji: '❓', value: 'sonstiges', label: 'Anderes Erbschaftsproblem' } ] },
    { id: 'testament', type: 'choice', text: 'Gibt es ein Testament?', options: [ { emoji: '📄', value: 'ja_notariell', label: 'Ja, notariell beurkundet' }, { emoji: '✍️', value: 'ja_handschriftlich', label: 'Ja, handschriftlich' }, { emoji: '❌', value: 'nein', label: 'Kein Testament bekannt' }, { emoji: '❓', value: 'unbekannt', label: 'Nicht sicher' } ] },
    { id: 'zeitpunkt', type: 'choice', text: 'Wann ist der Erbfall eingetreten?', options: [ { value: 'lt6w', label: 'Weniger als 6 Wochen her' }, { value: '6w_6m', label: '6 Wochen bis 6 Monate her' }, { value: 'gt6m', label: 'Mehr als 6 Monate her' } ] },
    { id: 'erben', type: 'choice', text: 'Wie viele Erben gibt es ungefähr?', options: [ { value: 'nur_ich', label: 'Nur ich' }, { value: '2_4', label: '2 bis 4 Personen' }, { value: 'gt4', label: 'Mehr als 4 Personen' }, { value: 'unbekannt', label: 'Noch nicht geklärt' } ] },
    { id: 'schulden', type: 'choice', text: 'Sind Schulden im Nachlass vorhanden?', options: [ { emoji: '✅', value: 'ja', label: 'Ja, es gibt Schulden' }, { emoji: '❌', value: 'nein', label: 'Nein' }, { emoji: '❓', value: 'unbekannt', label: 'Weiß ich noch nicht' } ] },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie zunächst?', options: [ { emoji: '💡', value: 'einschaetzung', label: 'Rechtliche Ersteinschätzung' }, { emoji: '📋', value: 'vorgehen', label: 'Konkretes Vorgehen planen' }, { emoji: '⚖️', value: 'streit', label: 'Erbstreit klären / Testament anfechten' } ] },
    { id: 'zusatz', type: 'text', text: 'Weitere Angaben?', placeholder: 'z.B. Immobilien im Nachlass, Konflikte unter den Erben …', multiline: true, required: false },
  ],
  sonstiges: [
    { id: 'beschreibung', type: 'text', text: 'Beschreiben Sie Ihr Anliegen', subtitle: 'Erklären Sie in eigenen Worten, was passiert ist und wobei Sie Hilfe benötigen.', placeholder: 'Was ist passiert? Wann? Wer ist beteiligt? Was möchten Sie erreichen?', multiline: true },
    { id: 'ziel', type: 'choice', text: 'Was möchten Sie zunächst?', options: [ { emoji: '💡', value: 'einschaetzung', label: 'Rechtliche Ersteinschätzung' }, { emoji: '📋', value: 'vorgehen', label: 'Konkretes Vorgehen planen' }, { emoji: '📄', value: 'dokument', label: 'Dokument oder Brief verfassen lassen' }, { emoji: '⚖️', value: 'anwalt', label: 'Anwalt finden' } ] },
  ],
};
const LABEL_MAP: Record<string, Record<string, string>> = {};
Object.values(CATEGORY_QUESTIONS).flat().forEach(q => {
  if (q.type === 'choice' || q.type === 'multichoice') {
    LABEL_MAP[q.id] = {};
    q.options.forEach(opt => { LABEL_MAP[q.id][opt.value] = opt.label; });
  }
});
function getLabel(questionId: string, value: string): string {
  return LABEL_MAP[questionId]?.[value] ?? value;
}

const QUESTION_LABELS: Record<string, string> = {
  situation: 'Situation', anliegen: 'Anliegen', vertragsart: 'Vertragsart', problem: 'Problem',
  schriftlich: 'Schriftliche Bestätigung', datum_kuendigung: 'Datum der Kündigung',
  kaufdatum: 'Kaufdatum', wohndauer: 'Wohndauer', ehedauer: 'Ehedauer',
  miete_gezahlt: 'Mietverhalten', mietvertrag: 'Mietvertrag', beschaeftigung: 'Beschäftigungsart',
  dauer: 'Beschäftigungsdauer', unternehmensgroesse: 'Unternehmensgröße', betriebsrat: 'Betriebsrat',
  grund: 'Kündigungsgrund', vertrag_vorhanden: 'Vertragsdokument', streitwert: 'Streitwert',
  kontakt_aufgenommen: 'Bisheriger Kontakt', kontakt: 'Bisheriger Kontakt', kaufort: 'Kaufort',
  kaufpreis: 'Kaufpreis', kinder: 'Gemeinsame Kinder', getrennt: 'Trennungssituation',
  einigkeit: 'Verhältnis zur Gegenseite', verletzt: 'Verletzte Personen', schuld: 'Schuldfrage',
  promille: 'Alkohol / Drogen', polizei: 'Polizeikontakt', zeugen: 'Beweise / Zeugen',
  testament: 'Testament vorhanden', zeitpunkt: 'Zeitpunkt Erbfall', erben: 'Anzahl Erben',
  schulden: 'Schulden im Nachlass', ziel: 'Ziel', beschreibung: 'Sachverhalt', zusatz: 'Weitere Angaben',
};

export function generateCaseDescription(category: string, answers: Answers): string {
  const questions = CATEGORY_QUESTIONS[category] ?? [];
  const lines: string[] = [];
  for (const q of questions) {
    const value = answers[q.id];
    if (!value || (typeof value === 'string' && value.trim() === '')) continue;
    const label = QUESTION_LABELS[q.id] ?? q.id;
    if (q.type === 'choice' || q.type === 'multichoice') {
      const valueArr = Array.isArray(value) ? value : [value];
      lines.push(`${label}: ${valueArr.map(v => getLabel(q.id, v)).join(', ')}`);
    } else {
      lines.push(`${label}: ${value}`);
    }
  }
  return lines.join('\n');
}

export function generateCaseTitle(category: string, answers: Answers): string {
  const situation = answers['situation'] || answers['anliegen'] || answers['vertragsart'] || '';
  const situationLabel = situation
    ? getLabel('situation', situation as string) || getLabel('anliegen', situation as string) || getLabel('vertragsart', situation as string)
    : '';
  const categoryLabels: Record<string, string> = {
    mietrecht: 'Mietrecht', arbeitsrecht: 'Arbeitsrecht', vertragsrecht: 'Vertragsrecht',
    verbraucherrecht: 'Verbraucherrecht', familienrecht: 'Familienrecht', verkehrsrecht: 'Verkehrsrecht',
    erbrecht: 'Erbrecht', sonstiges: 'Rechtsproblem',
  };
  const categoryLabel = categoryLabels[category] ?? 'Rechtsproblem';
  if (situationLabel && situationLabel !== categoryLabel) return `${categoryLabel}: ${situationLabel}`;
  return `Anfrage zu ${categoryLabel}`;
}

interface IntakeWizardProps { category: string; onComplete: (answers: Answers) => void; onBack: () => void; }

export default function IntakeWizard({ category, onComplete, onBack }: IntakeWizardProps) {
  const questions = CATEGORY_QUESTIONS[category] ?? CATEGORY_QUESTIONS['sonstiges'];
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const visibleQuestions = questions.filter(q => !q.condition || q.condition(answers));
  const current = visibleQuestions[currentIdx];
  const isLast = currentIdx === visibleQuestions.length - 1;
  const progress = ((currentIdx + 1) / visibleQuestions.length) * 100;
  const currentAnswer = current ? answers[current.id] : undefined;
  const canProceed = current
    ? current.required === false ? true
      : !!currentAnswer && (typeof currentAnswer === 'string' ? currentAnswer.trim().length > 0 : currentAnswer.length > 0)
    : true;

  const goNext = () => {
    if (!canProceed) return;
    if (isLast) { onComplete(answers); }
    else { setDirection(1); setCurrentIdx(i => i + 1); }
  };
  const goPrev = () => {
    if (currentIdx === 0) { onBack(); }
    else { setDirection(-1); setCurrentIdx(i => i - 1); }
  };
  const handleChoice = (questionId: string, value: string) => {
    setAnswers(a => ({ ...a, [questionId]: value }));
    setTimeout(() => { if (!isLast) { setDirection(1); setCurrentIdx(i => i + 1); } }, 200);
  };
  const handleMultiChoice = (questionId: string, value: string, maxSelect?: number) => {
    setAnswers(a => {
      const prev = (a[questionId] as string[] | undefined) ?? [];
      if (prev.includes(value)) return { ...a, [questionId]: prev.filter(v => v !== value) };
      if (maxSelect && prev.length >= maxSelect) return { ...a, [questionId]: [...prev.slice(1), value] };
      return { ...a, [questionId]: [...prev, value] };
    });
  };

  if (!current) return null;

  return (
    <div className="flex flex-col flex-1">
      <div className="h-1 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={current.id} custom={direction} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{current.text}</h2>
          {current.subtitle && <p className="text-slate-500 text-sm mb-6">{current.subtitle}</p>}

          {current.type === 'choice' && (
            <div className="space-y-2 mt-6">
              {current.options.map(opt => {
                const isSelected = answers[current.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => handleChoice(current.id, opt.value)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                    {opt.emoji && <span className="text-xl w-7 text-center flex-shrink-0">{opt.emoji}</span>}
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{opt.label}</span>
                    {isSelected && <span className="ml-auto text-blue-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'multichoice' && (
            <div className="space-y-2 mt-6">
              <p className="text-xs text-slate-400 mb-3">Mehrere Antworten möglich</p>
              {current.options.map(opt => {
                const selectedArr = (answers[current.id] as string[] | undefined) ?? [];
                const isSelected = selectedArr.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => handleMultiChoice(current.id, opt.value, current.maxSelect)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                    {opt.emoji && <span className="text-xl w-7 text-center">{opt.emoji}</span>}
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{opt.label}</span>
                    <div className={`ml-auto w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'text' && (
            <div className="mt-6">
              {current.multiline
                ? <textarea value={(answers[current.id] as string) ?? ''} onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))} placeholder={current.placeholder} rows={5} className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none" />
                : <input type="text" value={(answers[current.id] as string) ?? ''} onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))} placeholder={current.placeholder} className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" />}
              {current.required === false && <p className="text-xs text-slate-400 mt-2">Optional — kann leer gelassen werden</p>}
            </div>
          )}

          {current.type === 'date' && (
            <div className="mt-6">
              <input type="date" value={(answers[current.id] as string) ?? ''} onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))} max={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-10 pt-6 border-t border-slate-100">
        <button onClick={goPrev} className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        {(current.type !== 'choice' || isLast) && (
          <button onClick={goNext} disabled={!canProceed} className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {isLast ? 'Weiter zur Zusammenfassung' : 'Weiter'}
          </button>
        )}
        {current.type === 'choice' && !isLast && current.required === false && (
          <button onClick={goNext} className="px-5 py-3.5 text-slate-400 text-sm hover:text-slate-600 transition-colors">Überspringen</button>
        )}
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">Frage {currentIdx + 1} von {visibleQuestions.length}</p>
    </div>
  );
}
