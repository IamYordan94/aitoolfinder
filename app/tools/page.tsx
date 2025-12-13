import { getAllTools, getAllCategories, searchTools, getToolsByCategory } from '@/lib/supabase';
import ToolCard from '@/components/ToolCard';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import Pagination from '@/components/Pagination';
import { ToolCardSkeleton } from '@/components/LoadingSkeleton';
import AdSense from '@/components/AdSense';
import { Filter } from 'lucide-react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { Tool, Category } from '@/types/tool';

export const metadata: Metadata = {
  title: 'Browse AI Tools - aItoolfinder',
  description: 'Browse and discover AI tools for text, image, video, code, and more. Filter by category and find the perfect tool for your needs.',
};

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ToolsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    pricing?: string;
    page?: string;
  };
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const { search, category, sort, pricing, page } = searchParams;
  
  // Pagination settings
  const ITEMS_PER_PAGE = 24;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  
  // Always fetch total tools count for stats display
  let allTools: Tool[] = [];
  try {
    allTools = await getAllTools();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching all tools:', error);
    }
  }
  
  let tools: Tool[] = [];
  try {
    if (search) {
      tools = await searchTools(search);
    } else if (category) {
      tools = await getToolsByCategory(category);
    } else {
      tools = allTools;
    }

    // Apply filters
    if (pricing) {
      if (pricing === 'free') {
        tools = tools.filter(t => t.pricing_free === true);
      } else if (pricing === 'paid') {
        tools = tools.filter(t => t.pricing_tier === 'paid');
      } else if (pricing === 'freemium') {
        tools = tools.filter(t => t.pricing_tier === 'freemium');
      }
    }

    // Apply sorting
    if (sort === 'name') {
      tools.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      tools.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'oldest') {
      tools.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      // Default: popularity
      tools.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching tools:', error);
    }
    tools = [];
  }

  // Pagination
  const totalItems = tools.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTools = tools.slice(startIndex, endIndex);

  let categories: Category[] = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categories:', error);
    }
    categories = [];
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 py-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Browse All AI Tools
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Discover <span className="font-bold text-yellow-200">{allTools.length}+</span> AI tools across all categories
            </p>
            
            {/* Stats - Always show total, not filtered */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold text-white">{allTools.length}+</div>
                <div className="text-white/80 text-xs">Total Tools</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold text-white">{categories.length}</div>
                <div className="text-white/80 text-xs">Categories</div>
              </div>
              {(search || category) && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20">
                  <div className="text-2xl font-bold text-white">{tools.length}</div>
                  <div className="text-white/80 text-xs">Showing</div>
                </div>
              )}
            </div>
            
            <div className="max-w-2xl mx-auto mb-6">
              <SearchBar />
            </div>
            <div className="max-w-4xl mx-auto">
              <SearchFilters />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20 shadow-3d">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Categories</h2>
              </div>
              <div className="space-y-2">
                <a
                  href="/tools"
                  className={`block px-4 py-3 rounded-xl transition-all ${
                    !category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md tilt-3d'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:shadow-md'
                  }`}
                >
                  All Tools ({allTools.length})
                </a>
                {categories.map((cat) => {
                  const toolCount = allTools.filter(t => t.category === cat.name).length;
                  return (
                    <a
                      key={cat.id}
                      href={`/tools?category=${encodeURIComponent(cat.name)}`}
                      className={`block px-4 py-3 rounded-xl transition-all ${
                        category === cat.name
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md tilt-3d'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:shadow-md'
                      }`}
                    >
                      {cat.name} ({toolCount})
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Tools Grid */}
          <main className="flex-1">
            {search && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Found <span className="font-bold text-blue-600 dark:text-blue-400">{tools.length}</span> results for &quot;<span className="font-semibold">{search}</span>&quot;
                </p>
              </div>
            )}
            
            {tools.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center shadow-lg">
                {search ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold mb-2">No tools found for &quot;{search}&quot;</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
                    <a 
                      href="/tools" 
                      className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Clear Search
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold mb-2">Your database is empty</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by seeding your database with 100+ popular AI tools</p>
                    <a 
                      href="/seed" 
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      Seed Database with Initial Tools →
                    </a>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                )}
                
                {tools.length > 0 && totalPages <= 1 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 text-center">
                    <p className="text-gray-700 dark:text-gray-300">
                      Showing <span className="font-bold text-blue-600 dark:text-blue-400">{tools.length}</span> {tools.length === 1 ? 'tool' : 'tools'}
                      {category && ` in ${category}`}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Ad Section */}
            {tools.length > 6 && (
              <div className="mt-8">
                <AdSense />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
