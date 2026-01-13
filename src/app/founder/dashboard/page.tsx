'use client'

import { api } from '@/trpc/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FounderDashboardPage() {
  const { data: shortlist } = api.founder.getMyShortlist.useQuery()
  const { data: introRequests } = api.founder.getMyIntroRequests.useQuery()

  const pendingIntros = introRequests?.filter(req => req.status === 'pending').length || 0
  const approvedIntros = introRequests?.filter(req => req.status === 'approved').length || 0
  const rejectedIntros = introRequests?.filter(req => req.status === 'rejected').length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Founder Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to Pebblebed Current. Find and connect with top talent.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shortlist</div>
          <div className="text-3xl font-bold">{shortlist?.length || 0}</div>
          <Link href="/founder/shortlist">
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
              View all
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Intros</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingIntros}
          </div>
          <Link href="/founder/intro-requests">
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
              View all
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved Intros</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {approvedIntros}
          </div>
          <Link href="/founder/intro-requests">
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
              View all
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected Intros</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {rejectedIntros}
          </div>
          <Link href="/founder/intro-requests">
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
              View all
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/founder/talent">
            <Button className="w-full">Browse Talent Directory</Button>
          </Link>
          <Link href="/founder/shortlist">
            <Button variant="outline" className="w-full">
              Manage Shortlist
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Shortlist */}
      {shortlist && shortlist.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Shortlist</h2>
            <Link href="/founder/shortlist">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {shortlist.slice(0, 5).map((item: any) => (
              <Link
                key={item.id}
                href={`/founder/talent/${item.talent_profile_id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                  <div>
                    <div className="font-medium">{item.talent_profiles.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.talent_profiles.location || 'Location not specified'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Intro Requests */}
      {introRequests && introRequests.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Intro Requests</h2>
            <Link href="/founder/intro-requests">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {introRequests.slice(0, 5).map((request: any) => (
              <Link
                key={request.id}
                href={`/founder/intro-requests`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                  <div>
                    <div className="font-medium">{request.talent_profiles.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {request.status === 'pending' && 'Awaiting review'}
                      {request.status === 'approved' && 'Approved'}
                      {request.status === 'rejected' && 'Rejected'}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
