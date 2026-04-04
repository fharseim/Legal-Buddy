import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Message {
  id: string;
  case_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// In-memory fallback fuer Demo-Modus
const DEMO_MESSAGES: Record<string, Message[]> = {};

export const messageService = {
  async getMessages(caseId: string): Promise<Message[]> {
    if (!isSupabaseConfigured || !supabase) {
      return DEMO_MESSAGES[caseId] ?? [];
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Message[];
  },

  async addMessage(caseId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    if (!isSupabaseConfigured || !supabase) {
      const msg: Message = {
        id: crypto.randomUUID(),
        case_id: caseId,
        user_id: 'demo',
        role,
        content,
        created_at: new Date().toISOString(),
      };
      if (!DEMO_MESSAGES[caseId]) DEMO_MESSAGES[caseId] = [];
      DEMO_MESSAGES[caseId].push(msg);
      return msg;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({ case_id: caseId, role, content , user_id: (await supabase.auth.getUser()).data.user?.id})
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  },
};
