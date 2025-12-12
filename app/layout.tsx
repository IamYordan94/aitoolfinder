import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import WebVitals from '@/components/WebVitals';
import ErrorTrackingScript from '@/components/ErrorTrackingScript';
import ServiceWorker from '@/components/ServiceWorker';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: "aItoolfinder - Discover the Best AI Tools",
  description: "Comprehensive directory of AI tools for text, image, video, code, and more. Compare features, pricing, and find the perfect AI tool for your needs.",
  keywords: ["AI tools", "artificial intelligence", "AI directory", "compare AI tools", "AI software", "machine learning tools"],
  authors: [{ name: "aItoolfinder" }],
  other: {
    'google-adsense-account': 'ca-pub-9007185070437670',
  },
  openGraph: {
    title: "aItoolfinder - Discover the Best AI Tools",
    description: "Find, compare, and choose the perfect AI tool for your needs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aItoolfinder - Discover the Best AI Tools",
    description: "Comprehensive directory of AI tools for all your needs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9007185070437670" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* AdSense Script - beforeInteractive strategy injects into head */}
        <Script
          id="adsbygoogle-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-9007185070437670",
                enable_page_level_ads: true
              });
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9007185070437670"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <ThemeProvider>
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  AI
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">aItoolfinder</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" prefetch={true}>
                  Browse Tools
                </Link>
                <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" prefetch={true}>
                  Blog
                </Link>
                <Link href="/compare" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" prefetch={true}>
                  Compare
                </Link>
                <Link href="/tools" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Search tools">
                  <Search className="w-5 h-5" />
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        <ErrorBoundary>
          <main>{children}</main>
        </ErrorBoundary>
        <WebVitals />
        <ErrorTrackingScript />
        <ServiceWorker />
        <CookieConsent />
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">aItoolfinder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover and compare the best AI tools for your needs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/tools?category=Text AI" className="hover:text-gray-900 dark:hover:text-white transition-colors">Text AI</Link></li>
                  <li><Link href="/tools?category=Image AI" className="hover:text-gray-900 dark:hover:text-white transition-colors">Image AI</Link></li>
                  <li><Link href="/tools?category=Video AI" className="hover:text-gray-900 dark:hover:text-white transition-colors">Video AI</Link></li>
                  <li><Link href="/tools?category=Code AI" className="hover:text-gray-900 dark:hover:text-white transition-colors">Code AI</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/tools" className="hover:text-gray-900 dark:hover:text-white transition-colors">All Tools</Link></li>
                  <li><Link href="/compare" className="hover:text-gray-900 dark:hover:text-white transition-colors">Compare Tools</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">About</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Updated daily with the latest AI tools and features.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} aItoolfinder. All rights reserved.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
