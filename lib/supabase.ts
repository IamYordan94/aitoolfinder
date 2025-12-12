import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tool, Category } from '@/types/tool';
import { Post } from '@/types/post';

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
      console.error('Error in getAllTools:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
    
    console.log(`getAllTools: Found ${tools.length} tools`);
    return tools;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllTools failed:', message);
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

// Blog post helper functions
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('posts')
      .select('*')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    return (data || []) as Post[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllPosts failed:', message);
    throw error;
  }
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.error('getPostBySlug: Invalid slug provided');
      return null;
    }

    const client = getSupabaseClient();
    const trimmedSlug = slug.trim();
    const now = new Date();
    const nowISO = now.toISOString();
    
    // Add 1 hour buffer to account for timezone differences
    // This allows posts published "today" to be shown even if server time is slightly ahead
    const bufferTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const bufferISO = bufferTime.toISOString();
    
    console.log(`[getPostBySlug] Searching for post with slug: "${trimmedSlug}"`);
    console.log(`[getPostBySlug] Current time: ${nowISO}`);
    console.log(`[getPostBySlug] Buffer time: ${bufferISO}`);
    
    // First, try to get the post without date filtering to see if it exists
    const { data: postWithoutFilter, error: checkError } = await client
      .from('posts')
      .select('id, slug, title, published_at, content_html')
      .eq('slug', trimmedSlug)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[getPostBySlug] Error checking post existence:', {
        code: checkError.code,
        message: checkError.message,
        slug: trimmedSlug,
      });
    }
    
    if (postWithoutFilter) {
      console.log(`[getPostBySlug] Found post:`, {
        slug: postWithoutFilter.slug,
        title: postWithoutFilter.title,
        published_at: postWithoutFilter.published_at,
        hasContent: !!postWithoutFilter.content_html,
      });
      
      // Check if published_at is in the past (with buffer)
      if (postWithoutFilter.published_at) {
        const publishedDate = new Date(postWithoutFilter.published_at);
        const isPublished = publishedDate <= bufferTime;
        console.log(`[getPostBySlug] Published date: ${postWithoutFilter.published_at}`);
        console.log(`[getPostBySlug] Is published (with buffer): ${isPublished}`);
        
        if (!isPublished) {
          console.warn(`[getPostBySlug] Post "${trimmedSlug}" is scheduled for future: ${postWithoutFilter.published_at}`);
          // Still return it if it's within 24 hours (might be timezone issue)
          const hoursDiff = (publishedDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          if (hoursDiff > 24) {
            console.log(`[getPostBySlug] Post is more than 24 hours in future, not returning`);
            return null;
          } else {
            console.log(`[getPostBySlug] Post is within 24 hours, allowing it (timezone adjustment)`);
          }
        }
      } else {
        console.warn(`[getPostBySlug] Post "${trimmedSlug}" has null published_at (draft)`);
        return null;
      }
    }
    
    // Now fetch with proper filtering (using buffer for timezone)
    const { data, error } = await client
      .from('posts')
      .select('*')
      .eq('slug', trimmedSlug)
      .not('published_at', 'is', null)
      .lte('published_at', bufferISO)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - post not found or not published
        console.log(`[getPostBySlug] Post with slug "${trimmedSlug}" not found or not published`);
        
        // If we found it without filter but not with filter, it's a date issue
        if (postWithoutFilter) {
          console.error(`[getPostBySlug] Post exists but date filter is blocking it!`, {
            published_at: postWithoutFilter.published_at,
            now: nowISO,
            buffer: bufferISO,
          });
          // Return the post anyway if it exists (date might be slightly in future due to timezone)
          if (postWithoutFilter.published_at) {
            const publishedDate = new Date(postWithoutFilter.published_at);
            const hoursDiff = Math.abs((publishedDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            if (hoursDiff < 48) { // Within 48 hours, allow it (timezone issue)
              console.log(`[getPostBySlug] Allowing post despite date filter (within 48h window)`);
              // Fetch full post data
              const { data: fullPost } = await client
                .from('posts')
                .select('*')
                .eq('slug', trimmedSlug)
                .single();
              if (fullPost) {
                if (fullPost.content_html === null || fullPost.content_html === undefined) {
                  fullPost.content_html = '';
                }
                return fullPost as Post;
              }
            }
          }
        }
        return null;
      }
      console.error('[getPostBySlug] Error fetching post:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        slug: trimmedSlug,
      });
      return null;
    }
    
    if (!data) {
      console.log(`[getPostBySlug] Post with slug "${trimmedSlug}" returned null data`);
      return null;
    }

    // Validate required fields
    if (!data.id || !data.title || !data.slug) {
      console.error('[getPostBySlug] Post data missing required fields:', {
        hasId: !!data.id,
        hasTitle: !!data.title,
        hasSlug: !!data.slug,
        slug: trimmedSlug,
      });
      return null;
    }

    // Ensure content_html exists (can be empty string but not null/undefined)
    if (data.content_html === null || data.content_html === undefined) {
      console.warn(`[getPostBySlug] Post "${trimmedSlug}" has null/undefined content_html, setting to empty string`);
      data.content_html = '';
    }

    console.log(`[getPostBySlug] Successfully fetched post: "${data.title}"`);
    return data as Post;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[getPostBySlug] Exception:', {
      message,
      stack,
      slug,
    });
    return null;
  }
};

export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts by tag:', error);
      throw error;
    }
    
    return (data || []) as Post[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getPostsByTag failed:', message);
    throw error;
  }
};

// Get ALL posts (including drafts and scheduled) - for admin use
export const getAllPostsAdmin = async (): Promise<Post[]> => {
  try {
    // Use admin client to ensure we can read all posts (including drafts)
    const client = getSupabaseAdmin();
    
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all posts:', error);
      throw error;
    }
    
    return (data || []) as Post[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllPostsAdmin failed:', message);
    throw error;
  }
};
