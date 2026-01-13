import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-6xl font-bold">
          Pebblebed Current
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400">
          Talent flowing through the portfolio
        </p>

        <div className="flex gap-4 justify-center items-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
