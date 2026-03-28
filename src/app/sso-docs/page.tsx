'use client'

import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  Globe, 
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function SSODocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                SSO Integration Guide
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                For system developers integrating with PFS Portal Hub
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose dark:prose-invert max-w-none">
          
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              How SSO Works
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                The PFS Portal Hub uses a secure token-based SSO mechanism:
              </p>
              <ol className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 shrink-0">1</span>
                  <span>User logs in to the Hub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 shrink-0">2</span>
                  <span>User clicks on a system from the Dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 shrink-0">3</span>
                  <span>Hub generates a short-lived JWT token (5 minutes)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 shrink-0">4</span>
                  <span>User is redirected to the target system with the token</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 shrink-0">5</span>
                  <span>Target system validates the token and creates a local session</span>
                </li>
              </ol>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              API Endpoints
            </h2>
            
            <div className="space-y-4">
              {/* Generate Token */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-mono rounded">POST</span>
                  <code className="text-sm text-slate-700 dark:text-slate-300">/api/sso/token</code>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Hub Only)</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Generates an SSO token for a target system. Requires authentication.
                </p>
                <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Request Body:</p>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
{`{
  "systemId": "moldshop",
  "targetUrl": "https://moldshop.vercel.app/",
  "userMapping": {
    "localUsername": "john.doe"
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Validate Token */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-mono rounded">POST</span>
                  <code className="text-sm text-slate-700 dark:text-slate-300">/api/sso/validate</code>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Public)</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Validates an SSO token and returns user information.
                </p>
                <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Request Body:</p>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
{`{
  "token": "eyJhbG...",
  "systemId": "optional-system-check"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Integration Steps */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Integration Steps
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">1. Receive the Token</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Users will arrive at your login page with a <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">sso_token</code> query parameter:
                </p>
                <code className="block mt-2 text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-slate-700 dark:text-slate-300">
                  https://your-system.com/login?sso_token=eyJhbG...&hub_origin=https://hub.pfs-portal.com
                </code>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2. Validate the Token</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Send the token to the Hub's validation endpoint:
                </p>
                <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-slate-700 dark:text-slate-300 overflow-x-auto">
{`const response = await fetch('https://hub.pfs-portal.com/api/sso/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, systemId: 'your-system' }),
});

const data = await response.json();
// data.user contains: hubUserId, hubEmail, hubUserMetadata, userMapping`}
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">3. Create Local Session</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  After validation, create a local session for the user:
                </p>
                <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
                  <li>Find or create a user in your database using <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">hubUserId</code></li>
                  <li>Set your local session (cookie, JWT, etc.)</li>
                  <li>Redirect to your dashboard</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Security Considerations
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Token Expiration:</strong> Tokens expire after 5 minutes. Validate immediately upon receipt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>HTTPS Only:</strong> Always use HTTPS for token transmission.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No Token Storage:</strong> Don't store SSO tokens. Use them immediately to create local sessions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>User Mapping:</strong> Store <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">hubUserId</code> in your user table for future SSO connections.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Full Guide */}
          <section className="mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Need More Details?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                View the complete integration guide with code examples in multiple languages.
              </p>
              <a 
                href="/SSO_INTEGRATION_GUIDE.md" 
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Full Documentation
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
