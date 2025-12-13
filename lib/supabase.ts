import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tool, Category } from '@/types/tool';

// Lazy initialization function
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Missing'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Found' : 'Missing'}\n` +
      'Make sure you have restarted your dev server after creating .env.local'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export a getter function instead of direct client
export function getSupabase() {
  return getSupabaseClient();
}

// Server-side client with service role key for admin operations
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  }
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment variables');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database helper functions
export const getAllTools = async (): Promise<Tool[]> => {
  try {
    const client = getSupabaseClient();
    
    // Simple query - just get all tools
    const { data, error } = await client
      .from('tools')
      .select('*');
    
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getAllTools:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      }
      throw error;
    }
    
    const tools = (data || []) as Tool[];
    
    // Sort by popularity_score if available, otherwise by created_at
    if (tools.length > 0) {
      tools.sort((a, b) => {
        // First try popularity_score
        const scoreA = a.popularity_score || 0;
        const scoreB = b.popularity_score || 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        // If scores are equal, sort by created_at
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`getAllTools: Found ${tools.length} tools`);
    }
    return tools;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (process.env.NODE_ENV === 'development') {
      console.error('getAllTools failed:', message);
    }
    throw error;
  }
};

export const getToolBySlug = async (slug: string): Promise<Tool | null> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
};

export const searchTools = async (query: string): Promise<Tool[]> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .order('popularity_score', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getToolsByCategory = async (category: string): Promise<Tool[]> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .eq('category', category)
    .order('popularity_score', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

