import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Pebblebed Current</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Logged in as {user?.email}
        </p>
      </div>

      <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Redirecting...</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You should be automatically redirected to your role-specific dashboard.
        </p>
      </div>
    </div>
  )
}
