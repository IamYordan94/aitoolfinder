import { getPostBySlug, getAllTools } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import AdSense from '@/components/AdSense';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - aItoolfinder',
    };
  }

  return {
    title: `${post.title} - aItoolfinder Blog`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      images: post.hero_image_url ? [post.hero_image_url] : [],
    },
  };
}

// Get tools by names (for related tools)
async function getToolsByNames(toolNames: string[]): Promise<any[]> {
  if (!toolNames || toolNames.length === 0) return [];
  
  try {
    const allTools = await getAllTools();
    // Match tools by name (case-insensitive, partial match)
    const matchedTools = toolNames
      .map(name => {
        const normalizedName = name.trim().toLowerCase();
        return allTools.find(tool => 
          tool.name.toLowerCase() === normalizedName ||
          tool.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(tool.name.toLowerCase())
        );
      })
      .filter(Boolean) as any[];
    
    return matchedTools;
  } catch (error) {
    console.error('Error fetching related tools:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  // Get related tools if they exist
  const relatedTools = post.related_tools && post.related_tools.length > 0
    ? await getToolsByNames(post.related_tools)
    : [];

  const publishDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      {post.hero_image_url && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <img
            src={post.hero_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Post Header */}
        {!post.hero_image_url && (
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
          </div>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400">
          {publishDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishDate}</span>
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        {/* Post Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div
            className="blog-content text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
        </article>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Related Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="flex items-start gap-3">
                    {tool.logo_url && (
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      {tool.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Another Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        {/* Back to Blog */}
        <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Blog Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

