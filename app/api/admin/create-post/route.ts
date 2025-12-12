import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';
import { getNextAvailablePublishDate, generatePostSlug } from '@/lib/blog-utils';
import { CreatePostResponse } from '@/types/api';
import { isPostPublished } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

interface CreatePostRequest {
  title: string;
  excerpt?: string;
  content_html: string;
  tags?: string[];
  hero_image_url?: string;
  related_tools?: string[];
  published_at?: string | null; // null = auto-schedule, date string = specific date
  tool_slug?: string; // Optional: link to tool
}

/**
 * Creates a new blog post
 * @param request - Next.js request object with post data
 * @returns JSON response with created post or error
 */
export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const body: CreatePostRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.content_html) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title and content_html are required' 
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate slug from title
    let slug = generatePostSlug(body.title);
    
    // Ensure slug is unique
    let slugCounter = 1;
    let finalSlug = slug;
    while (true) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', finalSlug)
        .single();

      if (!existing) break;
      
      finalSlug = `${slug}-${slugCounter}`;
      slugCounter++;
    }

    // Determine publish date
    const getPublishedAt = async (value: string | null | 'now' | undefined): Promise<string | null> => {
      if (value === 'now') {
        return new Date().toISOString();
      }
      if (value === null || value === undefined) {
        // Auto-schedule: find next available date
        const nextDate = await getNextAvailablePublishDate();
        return nextDate.toISOString();
      }
      if (value) {
        // Specific date provided
        return new Date(value).toISOString();
      }
      return null; // Draft
    };

    const publishedAt = await getPublishedAt(body.published_at);

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: body.title,
        slug: finalSlug,
        excerpt: body.excerpt || null,
        content_html: body.content_html,
        tags: body.tags || [],
        hero_image_url: body.hero_image_url || null,
        related_tools: body.related_tools || null,
        published_at: publishedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Format response
    const response: CreatePostResponse = {
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        published_at: post.published_at,
      },
    };

    if (post.published_at) {
      if (isPostPublished(post.published_at)) {
        response.message = 'Post published successfully! Redirecting to Manage Posts...';
      } else {
        const publishDate = new Date(post.published_at);
        response.scheduled_for = publishDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        response.message = `Post created successfully! Scheduled for ${response.scheduled_for}`;
      }
    } else {
      response.message = 'Post created successfully! Saved as draft.';
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    console.error('Error creating post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}