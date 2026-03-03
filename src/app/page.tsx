import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
          Qalm
        </h1>
        <p className="mt-6 text-xl leading-8 text-gray-600">
          One profile. Infinite tailored applications.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/signup"
            className="rounded-md bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition"
          >
            Log In <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
