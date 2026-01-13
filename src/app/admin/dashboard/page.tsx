import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createServerClient()

  // Fetch stats
  const [
    { count: totalTalent },
    { count: visibleTalent },
    { count: pendingIntros },
    { count: pendingInvites },
  ] = await Promise.all([
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('visible_to_founders', true),
    supabase
      .from('intro_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('invites')
      .select('*', { count: 'exact', head: true })
      .eq('accepted', false),
  ])

  const stats = [
    {
      label: 'Total Talent',
      value: totalTalent || 0,
      href: '/admin/talent',
      description: 'Total profiles in system',
    },
    {
      label: 'Visible Talent',
      value: visibleTalent || 0,
      href: '/admin/talent?visible=true',
      description: 'Profiles visible to founders',
    },
    {
      label: 'Pending Intros',
      value: pendingIntros || 0,
      href: '/admin/intros?status=pending',
      description: 'Awaiting review',
    },
    {
      label: 'Pending Invites',
      value: pendingInvites || 0,
      href: '/admin/invites',
      description: 'Not yet accepted',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your VC talent pool
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/invites">
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <h3 className="font-bold mb-2">Send Invite</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Invite new talent to join the pool
              </p>
            </Card>
          </Link>
          <Link href="/admin/talent">
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <h3 className="font-bold mb-2">Browse Talent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage all talent profiles
              </p>
            </Card>
          </Link>
          <Link href="/admin/intros">
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <h3 className="font-bold mb-2">Review Intros</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Approve or reject introduction requests
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
