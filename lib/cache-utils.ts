import { NextResponse } from 'next/server';

/**
 * Generate ETag from data
 */
export function generateETag(data: any): string {
  const str = JSON.stringify(data);
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Add cache headers to response
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`
  );
  return response;
}

/**
 * Check if request has matching ETag (304 Not Modified)
 */
export function checkETag(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

/**
 * Get Cache-Control header string
 */
export function getCacheControl(
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400
): string {
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`;
}

/**
 * Create cached JSON response with ETag support
 */
export function createCachedResponse(
  data: any,
  request: Request,
  maxAge: number = 3600
): NextResponse {
  const etag = generateETag(data);
  
  // Check if client has cached version
  if (checkETag(request, etag)) {
    return new NextResponse(null, { status: 304 });
  }
  
  const response = NextResponse.json(data);
  response.headers.set('ETag', etag);
  return addCacheHeaders(response, maxAge);
}