'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'

export default function IntroRequestsPage() {
  const { data: introRequests, refetch } = api.founder.getMyIntroRequests.useQuery()

  const cancelRequest = api.founder.cancelIntroRequest.useMutation({
    onSuccess: () => {
      refetch()
      setSuccessMessage('Intro request cancelled')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [successMessage, setSuccessMessage] = useState('')

  const handleCancel = (id: string) => {
    if (confirm('Cancel this intro request?')) {
      cancelRequest.mutate({ id })
    }
  }

  const filteredRequests = introRequests?.filter((req) => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intro Requests</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your introduction requests
          </p>
        </div>
        <Link href="/founder/talent">
          <Button>Browse Talent</Button>
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          All ({introRequests?.length || 0})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Pending ({introRequests?.filter((r) => r.status === 'pending').length || 0})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'approved'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Approved ({introRequests?.filter((r) => r.status === 'approved').length || 0})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'rejected'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Rejected ({introRequests?.filter((r) => r.status === 'rejected').length || 0})
        </button>
      </div>

      {/* Intro Requests List */}
      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request: any) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start gap-6">
                <Link href={`/founder/talent/${request.talent_profile_id}`}>
                  <Avatar
                    src={request.talent_profiles.photo_url}
                    alt={request.talent_profiles.name}
                    fallback={request.talent_profiles.name}
                    size="xl"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link href={`/founder/talent/${request.talent_profile_id}`}>
                        <h3 className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
                          {request.talent_profiles.name}
                        </h3>
                      </Link>
                      {request.talent_profiles.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.talent_profiles.location}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Your Message</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {request.message}
                    </p>
                  </div>

                  {request.admin_response && (
                    <div className="mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm font-medium mb-1">Admin Response</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {request.admin_response}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Requested {formatDate(request.created_at)}</span>
                    {request.responded_at && (
                      <span>• Responded {formatDate(request.responded_at)}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/founder/talent/${request.talent_profile_id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  {request.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(request.id)}
                      disabled={cancelRequest.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all'
              ? 'No intro requests yet'
              : `No ${filter} intro requests`}
          </p>
          <Link href="/founder/talent">
            <Button>Browse Talent</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
