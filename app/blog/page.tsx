import Link from 'next/link';
import { getAllPosts } from '@/lib/supabase';
import { Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import AdSense from '@/components/AdSense';

export const metadata: Metadata = {
  title: 'Blog - aItoolfinder',
  description: 'Read articles about AI tools, reviews, comparisons, and guides to help you choose the best AI tools for your needs.',
  openGraph: {
    title: 'Blog - aItoolfinder',
    description: 'Read articles about AI tools, reviews, comparisons, and guides.',
    type: 'website',
  },
};

// Disable caching for this page to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  let posts: any[] = [];
  let errorMessage: string | null = null;
  
  try {
    posts = await getAllPosts();
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AI Tool Blog
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            Discover the latest AI tools, read in-depth reviews, comparisons, and comprehensive guides to help you choose the perfect AI tool for your needs.
          </p>
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AdSense />
      </div>

      {/* Posts Grid */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {errorMessage && (
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm">
              <p>Note: {errorMessage}</p>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 max-w-md mx-auto shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Blog Posts Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Blog posts will appear here once they're published. Check back soon for articles about AI tools, reviews, and guides!
                </p>
                <Link
                  href="/tools"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium transform hover:-translate-y-1"
                >
                  Browse AI Tools →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Latest Articles</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{posts.length} {posts.length === 1 ? 'article' : 'articles'} published</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-2 group card-3d"
                  >
                    {post.hero_image_url && (
                      <div className="mb-4 -mx-6 -mt-6 rounded-t-xl overflow-hidden">
                        <img
                          src={post.hero_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {post.published_at && (
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.tags.length} {post.tags.length === 1 ? 'tag' : 'tags'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AdSense />
      </div>
    </div>
  );
}

