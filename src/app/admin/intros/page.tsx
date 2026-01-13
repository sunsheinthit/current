'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'

export default function AdminIntroRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>('pending')
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const { data: introRequests, refetch } = api.admin.listIntroRequests.useQuery({
    status: selectedStatus,
  })

  const reviewRequest = api.admin.reviewIntroRequest.useMutation({
    onSuccess: () => {
      refetch()
      alert('Intro request reviewed successfully!')
    },
  })

  const handleReview = async (
    requestId: string,
    status: 'approved' | 'rejected'
  ) => {
    await reviewRequest.mutateAsync({
      id: requestId,
      status,
      adminNotes: adminNotes[requestId] || undefined,
    })
    setAdminNotes((prev) => {
      const updated = { ...prev }
      delete updated[requestId]
      return updated
    })
  }

  const statusColors: Record<string, 'success' | 'warning' | 'destructive'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Introduction Requests</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review and manage intro requests from founders
        </p>
      </div>

      <Tabs defaultValue="pending" onValueChange={(value) => setSelectedStatus(value as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus || 'pending'} className="mt-6">
          <div className="space-y-4">
            {introRequests && introRequests.length > 0 ? (
              introRequests.map((request: any) => (
                <Card key={request.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar
                          src={request.talent_profiles?.photo_url}
                          alt={request.talent_profiles?.name}
                          fallback={request.talent_profiles?.name}
                          size="lg"
                        />
                        <div>
                          <h3 className="text-lg font-bold">
                            {request.founder_profiles?.name || 'Unknown Founder'}
                            {' → '}
                            {request.talent_profiles?.name || 'Unknown Talent'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.founder_profiles?.companies?.name || 'No company'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Requested: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusColors[request.status]}>
                        {request.status}
                      </Badge>
                    </div>

                    {/* Founder's Message */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Founder's Message:
                      </p>
                      <p className="text-sm">{request.message}</p>
                    </div>

                    {/* Talent Info Preview */}
                    {request.talent_profiles && (
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <p className="text-sm font-medium mb-2">Talent Information:</p>
                        <div className="text-sm space-y-1">
                          {request.talent_profiles.location && (
                            <p className="text-gray-600 dark:text-gray-400">
                              📍 {request.talent_profiles.location}
                            </p>
                          )}
                          {request.talent_profiles.roles_interested && (
                            <p className="text-gray-600 dark:text-gray-400">
                              🎯 {request.talent_profiles.roles_interested.join(', ')}
                            </p>
                          )}
                          {request.talent_profiles.availability && (
                            <p className="text-gray-600 dark:text-gray-400">
                              ⏰ {request.talent_profiles.availability}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {request.status === 'pending' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Notes (optional)</label>
                        <Textarea
                          value={adminNotes[request.id] || ''}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="Add notes about this intro request..."
                        />
                      </div>
                    )}

                    {/* Review from admin */}
                    {request.status !== 'pending' && request.reviewed_at && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                        <p className="text-sm font-medium mb-1">
                          Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                        </p>
                        {request.admin_notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Notes: {request.admin_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleReview(request.id, 'approved')}
                          disabled={reviewRequest.isPending}
                          variant="default"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(request.id, 'rejected')}
                          disabled={reviewRequest.isPending}
                          variant="outline"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No {selectedStatus} intro requests
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
