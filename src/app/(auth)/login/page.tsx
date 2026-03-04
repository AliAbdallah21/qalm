import Link from 'next/link'
import { loginAction } from '../actions'
import { GithubLoginButton } from '@/components/auth/GithubLoginButton'

export default async function LoginPage({
    searchParams
}: {
    searchParams?: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const error = params?.error

    return (
        <div className="flex min-h-screen bg-white">
            {/* LEFT COLUMN: Branding & Quotes */}
            <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold italic text-xl">Q</span>
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">Qalm</span>
                    </Link>
                </div>

                <div className="max-w-md">
                    <h2 className="text-4xl font-bold leading-tight mb-8">
                        "Stop sending the same CV to every job. Start getting replies."
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">✓ Tailored CVs</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">✓ ATS Scoring</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">✓ Email Tracking</span>
                    </div>
                </div>

                <div className="text-gray-400 text-sm">
                    Trusted by job seekers in 10+ countries
                </div>
            </div>

            {/* RIGHT COLUMN: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20">
                <div className="w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                        <p className="mt-2 text-gray-600">Sign in to your Qalm account</p>
                    </div>

                    {error === 'auth' && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-center gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-600" />
                            Invalid login credentials.
                        </div>
                    )}

                    <form action={loginAction} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 sm:text-sm bg-gray-50/50 transition"
                                    placeholder="name@company.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 sm:text-sm bg-gray-50/50 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                        >
                            Sign in
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-400">
                                <span className="bg-white px-4">or continue with</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <GithubLoginButton />
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-bold text-black hover:underline transition">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
