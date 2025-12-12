'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Copy, Check, Loader2, FileText, Calendar, Tag, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { autoFillPostData } from '@/lib/blog-utils-client';
import { Tool } from '@/types/tool';
import { DELAYS } from '@/lib/constants';
import { AdminErrorBoundary } from '@/components/AdminErrorBoundary';

function CreatePostsContent() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [template, setTemplate] = useState('');
  const [templateCopied, setTemplateCopied] = useState(false);
  const [chatgptResponse, setChatgptResponse] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    excerpt: '',
    tags: [] as string[],
    hero_image_url: '',
    hero_image_prompt: '',
    related_tools: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string; scheduled_for?: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, needing: 0, hasPosts: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadUrl, setImageUploadUrl] = useState('');
  const searchParams = useSearchParams();
  const secretKey = searchParams.get('secret') || '';

  // Refresh stats function
  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/tools-needing-posts?secret=${encodeURIComponent(secretKey)}`);
      const data = await response.json();
      
      if (data.success) {
        setTools(data.tools);
        setStats({
          total: data.totalTools,
          needing: data.count,
          hasPosts: data.totalPosts,
        });
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [secretKey]);

  // Load tools needing posts
  useEffect(() => {
    if (!secretKey) {
      setLoading(false);
      return;
    }

    const fetchTools = async () => {
      try {
        await refreshStats();
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [secretKey, refreshStats]);

  // Load template for selected tool
  const loadTemplate = useCallback(async (tool: Tool) => {
    setSelectedTool(tool);
    setTemplate('');
    setChatgptResponse('');
    setAutoFilled(false);
    setPostData({ title: '', excerpt: '', tags: [], hero_image_url: '', hero_image_prompt: '', related_tools: [] });
    setResult(null);

    try {
      const response = await fetch(`/api/admin/blog-template/${tool.slug}?secret=${encodeURIComponent(secretKey)}`);
      const data = await response.json();
      
      if (data.success) {
        setTemplate(data.template);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }, [secretKey]);

  // Copy template to clipboard
  const copyTemplate = useCallback(() => {
    navigator.clipboard.writeText(template);
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), DELAYS.COPY_FEEDBACK);
  }, [template]);

  // Auto-fill from ChatGPT response
  const handleAutoFill = useCallback(() => {
    if (!chatgptResponse || !selectedTool) return;

    const filled = autoFillPostData(
      chatgptResponse,
      selectedTool.name,
      selectedTool.category || undefined,
      selectedTool.tags || []
    );

    // Update ChatGPT response with cleaned content
    setChatgptResponse(filled.cleaned_content);
    
    setPostData(prev => ({
      title: filled.title,
      excerpt: filled.excerpt,
      tags: filled.tags,
      hero_image_url: prev.hero_image_url, // Keep existing URL if set
      hero_image_prompt: filled.hero_image_prompt,
      related_tools: filled.related_tools,
    }));
    setAutoFilled(true);
  }, [chatgptResponse, selectedTool]);

  // Handle image upload (file or URL)
  const handleImageUpload = useCallback(async (file?: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      } else if (imageUploadUrl) {
        formData.append('imageUrl', imageUploadUrl);
      } else {
        alert('Please select a file or enter an image URL');
        setUploadingImage(false);
        return;
      }

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPostData({ ...postData, hero_image_url: data.url });
        setImageUploadUrl('');
        alert('Image uploaded successfully!');
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error uploading image: ${message}`);
    } finally {
      setUploadingImage(false);
    }
  }, [secretKey, imageUploadUrl, postData]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  // Create post
  const handleCreatePost = useCallback(async (publishAction: 'now' | 'schedule' | 'draft' = 'schedule') => {
    if (!chatgptResponse || !selectedTool) {
      alert('Please paste ChatGPT response first');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // Determine published_at value based on action
      let publishedAt: string | null | 'now' | 'draft' | 'schedule' = null;
      if (publishAction === 'now') {
        publishedAt = 'now';
      } else if (publishAction === 'draft') {
        publishedAt = 'draft'; // Use 'draft' to distinguish from 'schedule'
      } else {
        // 'schedule' - auto-schedule
        publishedAt = 'schedule'; // Use 'schedule' to trigger auto-scheduling
      }

      const response = await fetch('/api/admin/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          title: postData.title || `Complete Guide to ${selectedTool.name}`,
          excerpt: postData.excerpt || '',
          content_html: chatgptResponse,
          tags: postData.tags.length > 0 ? postData.tags : [selectedTool.category, selectedTool.name],
          hero_image_url: postData.hero_image_url || null,
          related_tools: postData.related_tools.length > 0 ? postData.related_tools : null,
          published_at: publishedAt,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // Remove tool from list
        setTools(tools.filter(t => t.id !== selectedTool.id));
        // Refresh stats from API to ensure accuracy
        await refreshStats();
        
        // Redirect to Manage page after a short delay
        setTimeout(() => {
          router.push(`/admin/blog/manage-posts?secret=${encodeURIComponent(secretKey)}`);
        }, DELAYS.REDIRECT_AFTER_CREATE);
      } else {
        setResult({ error: data.error });
        setSubmitting(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      setResult({ error: message });
      setSubmitting(false);
    }
  }, [chatgptResponse, selectedTool, postData, secretKey, tools, router, refreshStats]);

  // Check authorization
  if (!secretKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            Please provide your admin secret key in the URL: <code className="bg-gray-100 px-2 py-1 rounded">?secret=your-key</code>
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tools...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = stats.total > 0 
    ? Math.round(((stats.total - stats.needing) / stats.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Create Blog Posts
            </h1>
            <Link
              href={`/admin/blog/manage-posts?secret=${encodeURIComponent(secretKey)}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Manage Posts
            </Link>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tools</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.needing}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Need Posts</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.hasPosts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Have Posts</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completionPercentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Tools List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tools Needing Posts ({tools.length})
            </h2>
            
            {tools.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  All tools have blog posts! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedTool?.id === tool.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                    onClick={() => loadTemplate(tool)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{tool.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {tool.category}
                        </p>
                      </div>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Create Post Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {!selectedTool ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a tool from the list to create a blog post
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Create Post for: {selectedTool.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTool.category}
                  </p>
                </div>

                {/* Template Section */}
                {template && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ChatGPT Template
                    </label>
                    <div className="relative">
                      <textarea
                        readOnly
                        value={template}
                        className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono"
                      />
                      <button
                        onClick={copyTemplate}
                        className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                      >
                        {templateCopied ? (
                          <>
                            <Check className="w-4 h-4" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Copy this template and paste it into ChatGPT
                    </p>
                  </div>
                )}

                {/* ChatGPT Response */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste ChatGPT Response Here
                  </label>
                  <textarea
                    value={chatgptResponse}
                    onChange={(e) => {
                      setChatgptResponse(e.target.value);
                      setAutoFilled(false);
                    }}
                    placeholder="Paste the HTML content from ChatGPT here..."
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  {chatgptResponse && !autoFilled && (
                    <button
                      onClick={handleAutoFill}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Auto-fill Title, Excerpt & Tags
                    </button>
                  )}
                </div>

                {/* Auto-filled Data */}
                {autoFilled && (
                  <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        value={postData.excerpt}
                        onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={postData.tags.join(', ')}
                        onChange={(e) => setPostData({ ...postData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                        placeholder="tag1, tag2, tag3"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                    {postData.hero_image_prompt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hero Image Prompt (from ChatGPT)
                        </label>
                        <textarea
                          readOnly
                          value={postData.hero_image_prompt}
                          rows={3}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Use this prompt to generate an image, then paste the image URL below
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hero Image (Optional)
                      </label>
                      
                      {/* Upload Options */}
                      <div className="space-y-3 mb-3">
                        {/* File Upload */}
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleFileChange}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {uploadingImage ? 'Uploading...' : 'Upload from Computer'}
                              </span>
                            </div>
                          </label>
                        </div>

                        {/* URL Upload */}
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={imageUploadUrl}
                            onChange={(e) => setImageUploadUrl(e.target.value)}
                            placeholder="Paste image URL (e.g., from krea.ai)"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            disabled={uploadingImage}
                          />
                          <button
                            onClick={() => handleImageUpload()}
                            disabled={!imageUploadUrl || uploadingImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4" />
                                Download & Upload
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Upload images to Supabase Storage for permanent hosting. Images will be downloaded from external URLs and stored permanently.
                        </p>
                      </div>

                      {/* Current Image URL (editable) */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Or enter image URL directly:
                        </label>
                        <input
                          type="url"
                          value={postData.hero_image_url}
                          onChange={(e) => setPostData({ ...postData, hero_image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg (optional)"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      {/* Image Preview */}
                      {postData.hero_image_url && (
                        <div className="mt-3">
                          <img
                            src={postData.hero_image_url}
                            alt="Hero preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {postData.related_tools.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Related Tools (from ChatGPT)
                        </label>
                        <div className="space-y-2">
                          {postData.related_tools.map((tool, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tool}
                                onChange={(e) => {
                                  const newTools = [...postData.related_tools];
                                  newTools[index] = e.target.value;
                                  setPostData({ ...postData, related_tools: newTools });
                                }}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              />
                              <button
                                onClick={() => {
                                  const newTools = postData.related_tools.filter((_, i) => i !== index);
                                  setPostData({ ...postData, related_tools: newTools });
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setPostData({ ...postData, related_tools: [...postData.related_tools, ''] });
                          }}
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          + Add Tool
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          These should match tool names in your database for proper linking
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className={`p-4 rounded-lg ${
                    result.error 
                      ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
                      : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                  }`}>
                    {result.error ? (
                      <p className="text-red-800 dark:text-red-200">{result.error}</p>
                    ) : (
                      <div>
                        <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                          ✅ {result.message}
                        </p>
                        {result.scheduled_for && (
                          <p className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Scheduled for: {result.scheduled_for}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCreatePost('now')}
                    disabled={!chatgptResponse || submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Publish Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCreatePost('schedule')}
                    disabled={!chatgptResponse || submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCreatePost('draft')}
                    disabled={!chatgptResponse || submitting}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePostsPage() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <CreatePostsContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}

