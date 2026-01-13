import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator if you believe this is an error.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
