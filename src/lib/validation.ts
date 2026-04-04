// ─────────────────────────────────────────────
// Form-Validierung für Legal Buddy
// ─────────────────────────────────────────────

/** Validiert eine E-Mail-Adresse. Gibt Fehlermeldung zurück oder null. */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-Mail ist erforderlich';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Bitte gib eine gültige E-Mail-Adresse ein';
  return null;
}

/** Validiert ein Passwort auf Mindestanforderungen. */
export function validatePassword(password: string): string | null {
  if (!password) return 'Passwort ist erforderlich';
  if (password.length < 8) return 'Passwort muss mindestens 8 Zeichen haben';
  return null;
}

/** Validiert einen Namen. */
export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name ist erforderlich';
  if (name.trim().length < 2) return 'Name muss mindestens 2 Zeichen haben';
  return null;
}

export interface PasswordStrength {
  score: number;   // 0–4
  label: string;
  color: string;
}

/**
 * Berechnet die Passwortstärke (0 = sehr schwach, 4 = sehr stark).
 * Kriterien: Länge ≥8, Länge ≥12, Groß+Kleinbuchstaben, Ziffern, Sonderzeichen.
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'Sehr schwach', color: '#ef4444' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const labels: Record<typeof capped, string> = {
    0: 'Sehr schwach', 1: 'Schwach', 2: 'Mittel', 3: 'Stark', 4: 'Sehr stark',
  };
  const colors: Record<typeof capped, string> = {
    0: '#ef4444', 1: '#f97316', 2: '#eab308', 3: '#22c55e', 4: '#16a34a',
  };

  return { score: capped, label: labels[capped], color: colors[capped] };
}
