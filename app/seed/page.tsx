'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function SeedPageContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const searchParams = useSearchParams();

  // Check if we have a secret key in URL or need to prompt
  useEffect(() => {
    const urlSecret = searchParams.get('secret');
    if (urlSecret) {
      setSecretKey(urlSecret);
      setAuthorized(true);
    } else {
      // In development, auto-authorize
      if (process.env.NODE_ENV === 'development') {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    }
  }, [searchParams]);

  // Helper to add secret to requests
  const getAuthHeaders = (): Record<string, string> => {
    if (!secretKey) return {};
    return {
      'Authorization': `Bearer ${secretKey}`,
    };
  };

  const handleSeed = async () => {
    if (!authorized) {
      setResult({ error: 'Unauthorized. Please provide a valid secret key.' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders,
      };
      const response = await fetch('/api/seed-full', {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNew = async () => {
    if (!authorized) {
      setResult({ error: 'Unauthorized. Please provide a valid secret key.' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const url = new URL('/api/cron/update-tools', window.location.origin);
      if (secretKey) {
        url.searchParams.set('secret', secretKey);
      }
      const authHeaders = getAuthHeaders();
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Show authorization form if not authorized
  if (authorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-gray-600 mb-6">
              This page is protected. Please enter your admin secret key to continue.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Secret Key
              </label>
              <input
                id="secret"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && secretKey) {
                    setAuthorized(true);
                  }
                }}
              />
            </div>
            
            <button
              onClick={() => {
                if (secretKey) {
                  setAuthorized(true);
                  // Update URL with secret
                  window.history.replaceState({}, '', `?secret=${encodeURIComponent(secretKey)}`);
                }
              }}
              disabled={!secretKey}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Authenticate
            </button>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Note:</p>
                  <p>This page is only accessible with the admin secret key. Set <code className="bg-yellow-100 px-1 rounded">ADMIN_SECRET_KEY</code> in your environment variables.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authorization
  if (authorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Database Management</h1>
              <p className="text-gray-600">
                Get started by seeding your database with initial tools or fetch new tools from various sources.
              </p>
            </div>
            {process.env.NODE_ENV === 'production' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                Authenticated
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-blue-300 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">🚀 Populate Now (BEST OPTION)</h2>
              <p className="text-white/90 mb-4">
                Add 60+ comprehensive tools + fetch latest from GitHub/Hugging Face. This ensures your site is fully populated on deployment!
              </p>
              <button
                onClick={async () => {
                  setLoading(true);
                  setResult(null);
                  try {
                    const authHeaders = getAuthHeaders();
                    const headers: Record<string, string> = {
                      'Content-Type': 'application/json',
                      ...authHeaders,
                    };
                    const response = await fetch('/api/populate-now', { 
                      method: 'POST',
                      headers,
                    });
                    const data = await response.json();
                    setResult(data);
                  } catch (error: any) {
                    setResult({ error: error.message });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl font-bold text-lg w-full transform hover:scale-105"
              >
                {loading ? '⏳ Populating Database...' : '✨ Populate Now (60+ tools + Latest)'}
              </button>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📦 Seed Only (60+ Tools)</h2>
              <p className="text-gray-700 mb-4">
                Add 60+ comprehensive AI tools instantly. Includes all major tools like ChatGPT, Claude, Midjourney, and more.
              </p>
              <button
                onClick={handleSeed}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold text-lg w-full"
              >
                {loading ? '⏳ Seeding Database...' : '✨ Seed Comprehensive Tools (60+ tools)'}
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">🔄 Fetch New Tools</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Automatically discover and add new AI tools from GitHub, Hugging Face, and other sources.
                </p>
                <button
                  onClick={handleFetchNew}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium w-full"
                >
                  {loading ? 'Fetching...' : 'Fetch New Tools'}
                </button>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">🧪 Test Scrapers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Test the scraper functions without adding tools to your database.
                </p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    setResult(null);
                    try {
                      const url = new URL('/api/test-scraper', window.location.origin);
                      if (secretKey) {
                        url.searchParams.set('secret', secretKey);
                      }
                      const authHeaders = getAuthHeaders();
                      const response = await fetch(url.toString(), {
                        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
                      });
                      const data = await response.json();
                      setResult(data);
                    } catch (error: any) {
                      setResult({ error: error.message });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium w-full"
                >
                  {loading ? 'Testing...' : 'Test Scrapers'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Result</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            {result.success !== undefined && result.success > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold mb-2">
                  ✅ Success! {result.success} tools added.
                </p>
                <p className="text-green-700 text-sm">
                  Refresh the homepage to see them. Your website will automatically add 30-50 more tools every week!
                </p>
              </div>
            )}
            {result.results && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-semibold mb-2">📊 Population Results:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  {result.results.seeded && (
                    <li>• Seeded tools: {result.results.seeded}</li>
                  )}
                  {result.results.scrapedNew !== undefined && (
                    <li>• New tools from scraper: {result.results.scrapedNew}</li>
                  )}
                  {result.results.scrapedUpdated !== undefined && (
                    <li>• Tools updated: {result.results.scrapedUpdated}</li>
                  )}
                  {result.results.totalTools && (
                    <li className="font-bold">• Total tools in database: {result.results.totalTools}</li>
                  )}
                  {result.results.errors && result.results.errors.length > 0 && (
                    <li>• Errors: {result.results.errors.length}</li>
                  )}
                </ul>
                <p className="text-blue-600 text-xs mt-2">
                  💡 Your website automatically runs scraper every Monday at 6 AM UTC to add new tools
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SeedPageContent />
    </Suspense>
  );
}
