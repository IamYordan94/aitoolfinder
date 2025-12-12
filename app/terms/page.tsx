import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - aItoolfinder',
  description: 'Terms of Service for aItoolfinder - Read our terms and conditions for using our website.',
};

export default function TermsOfServicePage() {
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
          Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using aItoolfinder ("the Service"), you agree to be bound by these Terms 
              of Service ("Terms"). If you disagree with any part of these terms, you may not access 
              the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Permission is granted to temporarily access the materials on aItoolfinder's website for 
              personal, non-commercial transitory viewing only. This is the grant of a license, not 
              a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on aItoolfinder's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The materials on aItoolfinder's website are provided on an 'as is' basis. aItoolfinder makes 
              no warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Further, aItoolfinder does not warrant or make any representations concerning the accuracy, 
              likely results, or reliability of the use of the materials on its website or otherwise 
              relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In no event shall aItoolfinder or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use the materials on aItoolfinder's website, even if aItoolfinder 
              or an authorized representative has been notified orally or in writing of the possibility 
              of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              The materials appearing on aItoolfinder's website could include technical, typographical, or 
              photographic errors. aItoolfinder does not warrant that any of the materials on its website 
              are accurate, complete, or current. aItoolfinder may make changes to the materials contained 
              on its website at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              aItoolfinder has not reviewed all of the sites linked to its website and is not responsible 
              for the contents of any such linked site. The inclusion of any link does not imply 
              endorsement by aItoolfinder of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Modifications
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              aItoolfinder may revise these Terms of Service at any time without notice. By using this 
              website you are agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These terms and conditions are governed by and construed in accordance with applicable 
              laws. Any disputes relating to these terms shall be subject to the exclusive jurisdiction 
              of the courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Content and Third-Party Tools
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              aItoolfinder provides information about third-party AI tools and services. We are not 
              responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>The accuracy of information about third-party tools</li>
              <li>The availability or functionality of third-party tools</li>
              <li>Any transactions or interactions between you and third-party tool providers</li>
              <li>Any damages or losses resulting from use of third-party tools</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              When you click on links to third-party tools, you will be subject to their terms of 
              service and privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Prohibited Uses
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may not use our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any malicious code or viruses</li>
              <li>To attempt to gain unauthorized access to any part of the Service</li>
              <li>To interfere with or disrupt the Service or servers</li>
              <li>To use automated systems to access the Service without permission</li>
            </ul>
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

