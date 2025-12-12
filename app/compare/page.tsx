'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tool, Category } from '@/types/tool';
import AdSense from '@/components/AdSense';
import LoadingSpinner from '@/components/LoadingSpinner';
import { X, Plus, Sparkles } from 'lucide-react';

// Lazy load ToolComparison component (code splitting)
const ToolComparison = dynamic(() => import('@/components/ToolComparison'), {
  loading: () => <div className="text-center py-8 text-gray-500">Loading comparison...</div>,
  ssr: false,
});

export default function ComparePage() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        console.error('Error fetching categories:', error);
        setCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch tools based on selected category
  useEffect(() => {
    if (!selectedCategory) {
      setAllTools([]);
      setFilteredTools([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = selectedCategory === 'all' 
      ? '/api/tools'
      : `/api/tools?category=${encodeURIComponent(selectedCategory)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        const tools = Array.isArray(data) ? data : [];
        setAllTools(tools);
        setFilteredTools(tools);
      })
      .catch(error => {
        console.error('Error fetching tools:', error);
        setAllTools([]);
        setFilteredTools([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Filter tools by search query (within selected category)
  useEffect(() => {
    if (!Array.isArray(allTools)) {
      setFilteredTools([]);
      return;
    }
    
    if (searchQuery) {
      const filtered = allTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools(allTools);
    }
  }, [searchQuery, allTools]);

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

        {/* Category Selection - Show First - ALWAYS show when no category selected */}
        {selectedCategory === null && categories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose a Category to Compare Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* All Categories Option */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setAllTools([]);
                  setFilteredTools([]);
                }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl p-6 shadow-md text-center border-2 border-blue-300 dark:border-blue-600 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all transform hover:-translate-y-1"
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">All Categories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View all tools</p>
              </button>

              {/* Category Cards */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSearchQuery('');
                    setAllTools([]);
                    setFilteredTools([]);
                  }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl p-6 shadow-md text-center border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {category.name} tools
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show message if categories are loading */}
        {selectedCategory === null && categories.length === 0 && !categoriesLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8 transition-colors text-center">
            <p className="text-gray-600 dark:text-gray-400">No categories available. Please try refreshing the page.</p>
          </div>
        )}

        {/* Tool Selection - Show After Category Selected - ONLY show when category is selected */}
        {selectedCategory !== null && selectedCategory !== undefined && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTools.length === 0
                    ? `Select Tools from ${selectedCategory === 'all' ? 'All Categories' : selectedCategory}`
                    : selectedTools.length < 4
                    ? `Select ${4 - selectedTools.length} more tool${4 - selectedTools.length > 1 ? 's' : ''}`
                    : 'Maximum 4 tools selected'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setAllTools([]);
                    setFilteredTools([]);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Change Category
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedCategory === 'all' ? 'all' : selectedCategory} tools...`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ color: 'inherit' }}
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tools...</div>
            ) : !Array.isArray(filteredTools) || filteredTools.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tools found in {selectedCategory === 'all' ? 'all categories' : selectedCategory}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{tool.description}</p>
                      {tool.category && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {tool.category}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
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
