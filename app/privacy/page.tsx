import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - aItoolfinder',
  description: 'Privacy Policy for aItoolfinder - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block"
        >
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to aItoolfinder ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using aItoolfinder, you consent to the data practices described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.1 Automatically Collected Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you visit aItoolfinder, we automatically collect certain information about your device, 
              including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages you visit on our site</li>
              <li>Time and date of your visit</li>
              <li>Time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.2 Cookies and Tracking Technologies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and 
              store certain information. Cookies are files with a small amount of data that may include 
              an anonymous unique identifier.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Types of cookies we use:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (via Google AdSense)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Analyze how users interact with our website</li>
              <li>Display personalized advertisements through Google AdSense</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Third-Party Services
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.1 Google AdSense
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use Google AdSense to display advertisements on our website. Google AdSense uses 
              cookies to serve ads based on your prior visits to our website or other websites. 
              Google's use of advertising cookies enables it and its partners to serve ads to you 
              based on your visit to our site and/or other sites on the Internet.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may opt out of personalized advertising by visiting{' '}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Google's Ads Settings
              </a>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.2 Analytics
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              We use analytics tools to understand website performance and user behavior. This helps 
              us improve our services and user experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Data Storage and Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your 
              personal information. However, no method of transmission over the Internet or electronic 
              storage is 100% secure.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We do not store personal information beyond what is necessary for the operation of our 
              website. Most data collected is anonymous and aggregated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have certain rights regarding your personal information, 
              including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to request deletion of your personal data</li>
              <li>The right to opt-out of certain data collection practices</li>
              <li>The right to object to processing of your personal data</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can manage cookie preferences through your browser settings or our cookie consent banner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our website is not intended for children under the age of 13. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information 
              from a child under 13, please contact us and we will delete that information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Consent
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              By using our website, you consent to our Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href="/" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

