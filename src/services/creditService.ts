import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserCredits {
  credits_remaining: number;
  credits_used: number;
  updated_at: string;
}

export interface CreditPurchase {
  id: string;
  stripe_session_id: string;
  amount_cents: number;
  credits_added: number;
  paid_at: string;
}

export const creditService = {
  /** Returns the current user's credit balance. Returns null if no row exists yet (= 0 credits). */
  async getCredits(): Promise<UserCredits | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits_remaining, credits_used, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[creditService] getCredits error:', error);
      return null;
    }
    return data as UserCredits | null;
  },

  /** Returns purchase/invoice history for the current user. */
  async getPurchases(): Promise<CreditPurchase[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('credit_purchases')
      .select('id, stripe_session_id, amount_cents, credits_added, paid_at')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false });

    if (error) {
      console.error('[creditService] getPurchases error:', error);
      return [];
    }
    return (data ?? []) as CreditPurchase[];
  },

  /**
   * Atomically decrements 1 credit via DB function.
   * Returns true if the credit was deducted, false if no credits are available.
   */
  async decrementCredit(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode – always allow
      return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('decrement_credit', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('[creditService] decrementCredit error:', error);
      return false;
    }
    return data === true;
  },

  /**
   * Calls the backend to create a Stripe Checkout Session.
   * Returns the checkout URL to redirect to.
   */
  async createCheckoutSession(userId: string, userEmail: string): Promise<string> {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? 'Failed to create checkout session');
    }

    const { url } = (await response.json()) as { url: string };
    return url;
  },
};
