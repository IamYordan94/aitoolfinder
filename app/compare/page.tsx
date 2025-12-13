'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tool, Category } from '@/types/tool';
import AdSense from '@/components/AdSense';
import LoadingSpinner from '@/components/LoadingSpinner';
import { X, Plus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// Lazy load ToolComparison component (code splitting)
const ToolComparison = dynamic(() => import('@/components/ToolComparison'), {
  loading: () => <div className="text-center py-8 text-gray-500">Loading comparison...</div>,
  ssr: false,
});

export default function ComparePage() {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryTools, setCategoryTools] = useState<Map<string, Tool[]>>(new Map());
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    setCategoriesLoading(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching categories:', error);
        }
        setCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch tools when a category is expanded
  useEffect(() => {
    expandedCategories.forEach((categoryName) => {
      // Skip if tools already loaded
      if (categoryTools.has(categoryName) || loadingCategories.has(categoryName)) {
        return;
      }

      setLoadingCategories(prev => new Set(prev).add(categoryName));
      
      const url = categoryName === 'all' 
        ? '/api/tools'
        : `/api/tools?category=${encodeURIComponent(categoryName)}`;
      
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const tools = Array.isArray(data) ? data : [];
          setCategoryTools(prev => new Map(prev).set(categoryName, tools));
        })
        .catch(error => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Error fetching tools for ${categoryName}:`, error);
          }
          setCategoryTools(prev => new Map(prev).set(categoryName, []));
        })
        .finally(() => {
          setLoadingCategories(prev => {
            const next = new Set(prev);
            next.delete(categoryName);
            return next;
          });
        });
    });
  }, [expandedCategories, categoryTools, loadingCategories]);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // Get filtered tools for a category based on search query
  const getFilteredToolsForCategory = (categoryName: string): Tool[] => {
    const tools = categoryTools.get(categoryName) || [];
    if (!searchQuery) {
      return tools;
    }
    const query = searchQuery.toLowerCase();
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description?.toLowerCase().includes(query)
    );
  };

  const addTool = (tool: Tool) => {
    if (selectedTools.length < 4 && !selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
      setSearchQuery('');
    }
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter(t => t.id !== toolId));
  };

  if (categoriesLoading) {
    return (
      <LoadingSpinner 
        size="lg" 
        text="Loading categories..." 
        fullScreen={true} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Compare AI Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Select up to 4 tools to compare features, pricing, and use cases side-by-side.
        </p>

        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        {/* Selected Tools */}
        {selectedTools.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Selected Tools ({selectedTools.length}/4)</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{tool.name}</span>
                  <button
                    onClick={() => removeTool(tool.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label={`Remove ${tool.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <ToolComparison tools={selectedTools} onRemove={removeTool} />
          </div>
        )}

        {/* Category Selection with Accordion */}
        {categories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Select from category
            </h2>

            {/* Search Input - Works across all expanded categories */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools across expanded categories..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ color: 'inherit' }}
              />
            </div>

            <div className="space-y-4">
              {/* All Categories Option */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
                <button
                  onClick={() => toggleCategory('all')}
                  className="w-full p-6 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">All Categories</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">View all tools</p>
                    </div>
                  </div>
                  {expandedCategories.has('all') ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                
                {/* Expanded Tools for All Categories */}
                {expandedCategories.has('all') && (
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {loadingCategories.has('all') ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tools...</div>
                    ) : (
                      <>
                        {getFilteredToolsForCategory('all').length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tools found</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getFilteredToolsForCategory('all')
                              .filter(tool => !selectedTools.find(t => t.id === tool.id))
                              .slice(0, 12)
                              .map((tool) => (
                                <div
                                  key={tool.id}
                                  onClick={() => addTool(tool)}
                                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer transform hover:-translate-y-1 bg-white dark:bg-gray-900"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addTool(tool);
                                      }}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-green-600 dark:text-green-400 line-clamp-2">{tool.description}</p>
                                  {tool.category && (
                                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                      {tool.category}
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Category Cards with Accordion */}
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category.name);
                const tools = getFilteredToolsForCategory(category.name);
                const isLoading = loadingCategories.has(category.name);
                
                return (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full p-6 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {isExpanded && categoryTools.has(category.name) 
                              ? `${categoryTools.get(category.name)?.length || 0} tools`
                              : 'Click to expand'}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {/* Expanded Tools for Category */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        {isLoading ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tools...</div>
                        ) : (
                          <>
                            {tools.length === 0 ? (
                              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tools found in {category.name}</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tools
                                  .filter(tool => !selectedTools.find(t => t.id === tool.id))
                                  .slice(0, 12)
                                  .map((tool) => (
                                    <div
                                      key={tool.id}
                                      onClick={() => addTool(tool)}
                                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer transform hover:-translate-y-1 bg-white dark:bg-gray-900"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addTool(tool);
                                          }}
                                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                        >
                                          <Plus className="w-5 h-5" />
                                        </button>
                                      </div>
                                      <p className="text-sm text-green-600 dark:text-green-400 line-clamp-2">{tool.description}</p>
                                      {tool.category && (
                                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                          {tool.category}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show message if categories are loading */}
        {categories.length === 0 && !categoriesLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8 transition-colors text-center">
            <p className="text-gray-600 dark:text-gray-400">No categories available. Please try refreshing the page.</p>
          </div>
        )}

        {/* Ad Section */}
        <div className="mt-8">
          <AdSense />
        </div>
      </div>
    </div>
  );
}
