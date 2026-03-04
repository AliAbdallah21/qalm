import Link from 'next/link'
import { Check, Target, BarChart3, Mail, Linkedin, Zap, ArrowRight, Github } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-text-main rounded-lg flex items-center justify-center">
            <span className="text-bg-primary font-bold italic text-xl">Q</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-text-main">Qalm</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-text-sub hover:text-text-main transition">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-text-main px-5 py-2 text-sm font-semibold text-bg-primary hover:opacity-90 transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative px-6 py-20 lg:py-32 lg:px-12 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-8">
            <Zap size={12} fill="currentColor" />
            AI-Powered Career Intelligence
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            One profile.<br />
            <span className="text-indigo-600">Every job.</span> Perfectly tailored.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Qalm reads any job description and instantly generates a tailored CV, cover letter, and ATS score. Then tracks every application automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              See how it works
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Free to start · No credit card required
          </p>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 px-6 lg:px-12 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to land the job</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Skip the busywork and focus on what matters: getting the interview invitation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Target className="text-indigo-600" />}
                title="Tailored CVs"
                description="AI reads the JD and rewrites your CV to match. Different CV for every job, automatically."
              />
              <FeatureCard
                icon={<BarChart3 className="text-indigo-600" />}
                title="ATS Score"
                description="See exactly which keywords matched and which are missing before you apply."
              />
              <FeatureCard
                icon={<Mail className="text-indigo-600" />}
                title="Cover Letters"
                description="One click generates a tailored cover letter for any role."
              />
              <FeatureCard
                icon={<Linkedin className="text-indigo-600" />}
                title="LinkedIn Import"
                description="Upload your LinkedIn ZIP and your entire profile is populated in seconds."
              />
              <FeatureCard
                icon={<Github className="text-indigo-600" />}
                title="Email Intelligence"
                description="Connect Gmail and Qalm auto-tracks every reply, interview invite, and rejection."
              />
              <FeatureCard
                icon={<ArrowRight className="text-indigo-600" />}
                title="Career Analytics"
                description="AI analyzes your job search and tells you exactly what to do next."
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 px-6 lg:px-12 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold">Get your first tailored CV in 3 minutes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <Step
                num="1"
                title="Import your profile"
                description="Upload LinkedIn ZIP or fill your experience manually to set your base."
              />
              <Step
                num="2"
                title="Paste any job description"
                description="Qalm tailors your CV and scores it instantly against the specific role."
              />
              <Step
                num="3"
                title="Apply with confidence"
                description="Download the tailored PDF, save the application, and track all replies."
              />
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 px-6 lg:px-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">Simple, honest pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* FREE CARD */}
              <div className="bg-white p-10 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-extrabold mb-6">$0 <span className="text-lg font-normal text-gray-400">/ month</span></div>
                  <ul className="space-y-4 mb-10">
                    <PricingItem text="5 CV generations per month" />
                    <PricingItem text="LinkedIn import" />
                    <PricingItem text="GitHub sync" />
                    <PricingItem text="Job tracker" />
                    <PricingItem text="Basic ATS score" />
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="w-full py-3 text-center rounded-xl border-2 border-black font-bold hover:bg-gray-50 transition"
                >
                  Get started free
                </Link>
              </div>

              {/* PRO CARD */}
              <div className="bg-black text-white p-10 rounded-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-widest">Recommended</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-extrabold mb-6">$9.99 <span className="text-lg font-normal text-gray-400">/ month</span></div>
                  <ul className="space-y-4 mb-10">
                    <PricingItem text="Unlimited CV generations" dark />
                    <PricingItem text="Cover letter generation" dark />
                    <PricingItem text="Email intelligence (Gmail)" dark />
                    <PricingItem text="Advanced ATS breakdown" dark />
                    <PricingItem text="Career intelligence reports" dark />
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="w-full py-3 text-center rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-12 lg:px-12 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold italic text-sm">Q</span>
            </div>
            <span className="font-bold text-gray-400">Qalm © 2026</span>
          </div>
          <p className="text-gray-400 text-sm">
            Built for job seekers who are serious about getting hired.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-text-main">{title}</h3>
      <p className="text-text-sub text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ num, title, description }: { num: string, title: string, description: string }) {
  return (
    <div className="relative">
      <div className="text-8xl font-black text-text-muted opacity-10 absolute -top-8 -left-4 z-0">{num}</div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 text-text-main">{title}</h3>
        <p className="text-text-sub leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  )
}

function PricingItem({ text, dark = false }: { text: string, dark?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${dark ? 'bg-bg-primary/20 text-bg-primary' : 'bg-accent-subtle text-accent'}`}>
        <Check size={12} />
      </div>
      <span className={`text-sm ${dark ? 'opacity-80' : 'text-text-sub'}`}>{text}</span>
    </li>
  )
}
