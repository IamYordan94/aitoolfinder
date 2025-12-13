import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import SearchBar from '@/components/SearchBar';
import AdSense from '@/components/AdSense';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import { fetchToolsWithFallback } from '@/lib/data-fetch-utils';

export const metadata: Metadata = {
  title: 'aItoolfinder - Discover the Best AI Tools',
  description: 'Comprehensive directory of AI tools for text, image, video, code, and more. Compare features, pricing, and find the perfect AI tool for your needs.',
  openGraph: {
    title: 'aItoolfinder - Discover the Best AI Tools',
    description: 'Find, compare, and choose the perfect AI tool for your needs.',
    type: 'website',
  },
};

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

export default async function Home() {
  const { tools, categories, errorMessage } = await fetchToolsWithFallback();
  
  // Debug: Log what we got (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Homepage - Tools count:', tools.length, 'Categories count:', categories.length);
    if (tools.length === 0 && categories.length > 0) {
      console.log('Warning: No tools found but categories exist. Check /api/debug-tools for details.');
    }
  }

  const featuredTools = tools.slice(0, 6);
  const newTools = tools.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Discover the Best
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                AI Tools
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg">
              Find, compare, and choose the perfect AI tool for your needs. 
              <span className="block mt-2 text-lg">Updated weekly with the latest tools and features.</span>
            </p>
            
            {/* Stats */}
            {tools.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{tools.length}+</div>
                  <div className="text-white/80 text-sm">AI Tools</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{categories.length}</div>
                  <div className="text-white/80 text-sm">Categories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">Weekly</div>
                  <div className="text-white/80 text-sm">Updates</div>
                </div>
              </div>
            )}
            {tools.length === 0 && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-blue-900 dark:text-blue-100 max-w-2xl mx-auto shadow-md">
                <p className="font-bold text-lg mb-2 dark:text-blue-100">🚀 Get Started - Seed Your Database</p>
                <p className="text-sm mb-4 text-blue-700 dark:text-blue-200">Your database is empty. Click below to add 100+ popular AI tools instantly:</p>
                <a 
                  href="/seed" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium transform hover:scale-105"
                >
                  Seed Database Now →
                </a>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm max-w-2xl mx-auto">
                <p>Note: {errorMessage}</p>
                <p className="mt-2">Tools are available when browsing by category.</p>
              </div>
            )}
            <div className="flex justify-center">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdSense />
      </div>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Browse by Category</h2>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/tools?category=${encodeURIComponent(category.name)}`}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-6 shadow-3d card-3d text-center border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tools.filter(t => t.category === category.name).length} tools
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Tools</h2>
            <Link href="/tools" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {featuredTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 max-w-md mx-auto">
                <p className="text-gray-500 text-lg mb-2 font-semibold">No featured tools available yet</p>
                <p className="text-gray-400 text-sm mb-6">Total tools in database: <span className="font-bold text-gray-600">{tools.length}</span></p>
                {tools.length === 0 && (
                  <a 
                    href="/seed" 
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Seed Database with Initial Tools →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdSense />
      </div>

      {/* New Tools */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
            <Link href="/tools" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {newTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 max-w-md mx-auto">
                <p className="text-gray-500 text-lg mb-2 font-semibold">No tools available yet</p>
                <p className="text-gray-400 text-sm mb-6">Total tools in database: <span className="font-bold text-gray-600">{tools.length}</span></p>
                {tools.length === 0 && (
                  <a 
                    href="/seed" 
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Seed Database with Initial Tools →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
