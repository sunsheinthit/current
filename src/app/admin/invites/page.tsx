'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminInvitesPage() {
  const [email, setEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const { data: invites, refetch } = api.admin.listInvites.useQuery()
  const createInvite = api.admin.createInvite.useMutation({
    onSuccess: (data) => {
      setInviteLink(data.inviteLink)
      setEmail('')
      refetch()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      createInvite.mutate({ email })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Invite Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Send invites to new talent
        </p>
      </div>

      {/* Create Invite Form */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Create New Invite</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="talent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={createInvite.isPending}>
            {createInvite.isPending ? 'Creating...' : 'Create Invite'}
          </Button>
        </form>

        {/* Display generated link */}
        {inviteLink && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Invite link generated!
            </p>
            <div className="flex items-center space-x-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                Copy
              </Button>
            </div>
          </div>
        )}

        {createInvite.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              {createInvite.error.message}
            </p>
          </div>
        )}
      </Card>

      {/* Invites List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Invites</h2>
        <div className="space-y-4">
          {invites && invites.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {invites.map((invite: any) => {
                const expiresAt = new Date(invite.expires_at)
                const now = new Date()
                const isExpired = now > expiresAt
                const isAccepted = invite.accepted

                return (
                  <div key={invite.id} className="py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created: {new Date(invite.created_at).toLocaleDateString()}
                        {' • '}
                        Expires: {expiresAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {isAccepted ? (
                        <Badge variant="success">Accepted</Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No invites yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
