'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tool, Category } from '@/types/tool';
import AdSense from '@/components/AdSense';
import LoadingSpinner from '@/components/LoadingSpinner';
import { X, Plus, Filter } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    const url = selectedCategory 
      ? `/api/tools?category=${encodeURIComponent(selectedCategory)}`
      : '/api/tools';
    
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

  if (loading || categoriesLoading) {
    return (
      <LoadingSpinner 
        size="lg" 
        text="Loading tools..." 
        fullScreen={true} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Compare AI Tools</h1>
        <p className="text-gray-600 mb-8">
          Select up to 4 tools to compare features, pricing, and use cases side-by-side.
        </p>

        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        {/* Selected Tools */}
        {selectedTools.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Tools ({selectedTools.length}/4)</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{tool.name}</span>
                  <button
                    onClick={() => removeTool(tool.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
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

        {/* Tool Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedTools.length === 0
              ? 'Select Tools to Compare'
              : selectedTools.length < 4
              ? `Select ${4 - selectedTools.length} more tool${4 - selectedTools.length > 1 ? 's' : ''}`
              : 'Maximum 4 tools selected'}
          </h2>
          
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value || null);
                setSearchQuery(''); // Clear search when category changes
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedCategory ? `Search ${selectedCategory} tools...` : "Search for tools to add..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {!Array.isArray(filteredTools) || filteredTools.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tools found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools
                .filter(tool => !selectedTools.find(t => t.id === tool.id))
                .slice(0, 12)
                .map((tool) => (
                  <div
                    key={tool.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer transform hover:-translate-y-1"
                    onClick={() => addTool(tool)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                      <button className="text-blue-600 hover:text-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>
                    {tool.category && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {tool.category}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Ad Section */}
        <div className="mt-8">
          <AdSense />
        </div>
      </div>
    </div>
  );
}
