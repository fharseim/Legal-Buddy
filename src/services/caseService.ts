import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Case {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  ai_analysis?: string;
  ai_recommendations?: string[];
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  title: string;
  category: string;
  description?: string;
  urgency?: Case['urgency'];
}

export interface UpdateCaseInput {
  title?: string;
  category?: string;
  description?: string;
  status?: Case['status'];
  ai_analysis?: string;
  ai_recommendations?: string[];
  urgency?: Case['urgency'];
}

const DEMO_CASES: Case[] = [];

export const caseService = {
  async getCases(): Promise<Case[]> {
    if (!isSupabaseConfigured || !supabase) return DEMO_CASES;
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Case[];
  },

  async getCase(id: string): Promise<Case | null> {
    if (!isSupabaseConfigured || !supabase) return DEMO_CASES.find(c => c.id === id) ?? null;
    const { data, error } = await supabase.from('cases').select('*').eq('id', id).single();
    if (error) return null;
    return data as Case;
  },

  async createCase(input: CreateCaseInput): Promise<Case> {
    if (!isSupabaseConfigured || !supabase) {
      const demoCase: Case = {
        id: crypto.randomUUID(),
        user_id: 'demo',
        title: input.title,
        category: input.category,
        description: input.description,
        status: 'open',
        urgency: input.urgency ?? 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      DEMO_CASES.unshift(demoCase);
      return demoCase;
    }
    // Get current user id for RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        title: input.title,
        category: input.category,
        description: input.description,
        urgency: input.urgency ?? 'normal',
      })
      .select()
      .single();
    if (error) throw error;
    return data as Case;
  },

  async updateCase(id: string, input: UpdateCaseInput): Promise<Case> {
    if (!isSupabaseConfigured || !supabase) {
      const idx = DEMO_CASES.findIndex(c => c.id === id);
      if (idx >= 0) {
        DEMO_CASES[idx] = { ...DEMO_CASES[idx], ...input, updated_at: new Date().toISOString() };
        return DEMO_CASES[idx];
      }
      throw new Error('Case not found');
    }
    const { data, error } = await supabase
      .from('cases')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Case;
  },

  async deleteCase(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const idx = DEMO_CASES.findIndex(c => c.id === id);
      if (idx >= 0) DEMO_CASES.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('cases').delete().eq('id', id);
    if (error) throw error;
  },
};
