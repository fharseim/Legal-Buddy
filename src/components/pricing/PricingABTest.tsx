// A/B-Test Wrapper â weist jedem Besucher eine Variante zu und trackt Conversions
// Varianten: A (Zeit-first), B (Tiered Leistung), C (Freemium)
// Zuweisung: zufÃ¤llig, 1/3 je, persistiert in localStorage
// Tracking: supabase.from('ab_events').insert(...)

import { useEffect, useState } from 'react';
import { PricingA } from './PricingA';
import { PricingB } from './PricingB';
import { PricingC } from './PricingC';
import { supabase } from '../../lib/supabase';

type Variant = 'A' | 'B' | 'C';

const STORAGE_KEY = 'lb_pricing_variant';
const SESSION_KEY = 'lb_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function assignVariant(): Variant {
  const stored = localStorage.getItem(STORAGE_KEY) as Variant | null;
  if (stored && ['A', 'B', 'C'].includes(stored)) return stored;
  const variants: Variant[] = ['A', 'B', 'C'];
  const v = variants[Math.floor(Math.random() * 3)];
  localStorage.setItem(STORAGE_KEY, v);
  return v;
}

async function trackEvent(variant: Variant, event: string, meta?: Record<string, string>) {
  if (!supabase) return; // Supabase not configured (demo mode)
  try {
    await supabase.from('ab_events').insert({
      variant,
      event,
      session_id: getSessionId(),
      meta: meta ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Tracking should never break the page
  }
}

export const PricingABTest = () => {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const v = assignVariant();
    setVariant(v);
    trackEvent(v, 'pricing_viewed');
  }, []);

  if (!variant) return null; // Avoid layout shift during SSR/hydration

  if (variant === 'A')
    return (
      <PricingA
        onCtaClick={() => trackEvent('A', 'cta_clicked', { cta: 'main' })}
      />
    );

  if (variant === 'B')
    return (
      <PricingB
        onCtaClick={(tier) => trackEvent('B', 'cta_clicked', { tier })}
      />
    );

  return (
    <PricingC
      onCtaClick={(action) => trackEvent('C', 'cta_clicked', { action })}
    />
  );
};
