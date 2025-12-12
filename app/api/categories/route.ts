import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Edge Runtime for faster cold starts
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per minute per IP
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, 100, 60 * 1000);
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  }

  try {
    const categories = await getAllCategories();
    
    // Ensure we always return an array
    const data = Array.isArray(categories) ? categories : [];
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=3600',
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of error object
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}

