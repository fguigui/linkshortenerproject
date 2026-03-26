import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Link2,
  Zap,
  BarChart3,
  Share2,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default async function HomePage() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shorten Your Links
              </span>
              <br />
              <span className="text-white">Amplify Your Reach</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto">
              Create short, memorable links and track their performance with detailed analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <SignUpButton mode="redirect">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 rounded-lg text-lg font-semibold flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </SignUpButton>
            <SignInButton mode="redirect">
              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 rounded-lg text-lg font-semibold"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful Features Built for You
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to shorten, share, and track your links
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Instant Link Shortening
            </h3>
            <p className="text-slate-400">
              Convert long URLs into clean, shareable short links in seconds. No complicated setup required.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Detailed Analytics
            </h3>
            <p className="text-slate-400">
              Track clicks, visitors, and engagement metrics for each link. Understand your audience better.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-slate-400">
              Optimized infrastructure ensures your links redirect instantly, keeping bounce rates low.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Easy Sharing
            </h3>
            <p className="text-slate-400">
              Share your short links on social media, emails, and messages with a single click.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Custom Expiration
            </h3>
            <p className="text-slate-400">
              Set expiration dates for temporary links or keep them active indefinitely.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Secure & Private
            </h3>
            <p className="text-slate-400">
              Your data is encrypted and protected. We never track personal information.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100">
            Join thousands of users who are already shortening their links and tracking their success.
          </p>
          <SignUpButton mode="modal">
            <Button className="bg-white text-purple-600 hover:bg-slate-100 px-10 py-3 rounded-lg text-lg font-semibold">
              Create Your Free Account
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-2">
            <h3 className="text-white font-semibold">Link Shortener</h3>
            <p className="text-slate-400">
              Making link sharing simple, fast, and trackable.
            </p>
            <p className="text-slate-500 text-sm pt-4">
              © 2024 Link Shortener. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
