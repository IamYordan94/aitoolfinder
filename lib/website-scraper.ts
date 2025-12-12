/**
 * Website scraper utility to extract information from tool websites
 * This helps enrich tool data with real information from their websites
 */

interface WebsiteInfo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  features?: string[];
  pricing?: string;
}

/**
 * Extract basic metadata from a website URL
 * Uses Open Graph tags and meta tags
 */
export async function scrapeWebsiteInfo(url: string): Promise<WebsiteInfo | null> {
  try {
    // Use a proxy or direct fetch (note: some sites block direct scraping)
    // For production, consider using a service like ScraperAPI or similar
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; aItoolfinder/1.0; +https://yoursite.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    // Extract Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1].trim() : undefined;

    // Extract keywords
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const keywords = keywordsMatch 
      ? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k.length > 0)
      : undefined;

    return {
      title,
      description,
      keywords,
      ogImage,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Extract pricing information from common patterns
 */
export function extractPricingFromText(text: string): string | null {
  const pricingPatterns = [
    /\$(\d+)\/month/i,
    /\$(\d+)\/mo/i,
    /\$(\d+)\s*per\s*month/i,
    /(\d+)\s*USD\s*\/\s*month/i,
    /free/i,
    /freemium/i,
  ];

  for (const pattern of pricingPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes('free')) {
        return 'Free';
      }
      return `$${match[1]}/month`;
    }
  }

  return null;
}

/**
 * Generate a better description from website content
 */
export function generateEnhancedDescription(
  originalDescription: string,
  websiteInfo: WebsiteInfo | null
): string {
  if (!websiteInfo) {
    return originalDescription;
  }

  // Combine original with website description if available
  if (websiteInfo.description && websiteInfo.description.length > 50) {
    // Use website description if it's more detailed
    if (websiteInfo.description.length > originalDescription.length) {
      return websiteInfo.description.substring(0, 500);
    }
  }

  return originalDescription;
}

