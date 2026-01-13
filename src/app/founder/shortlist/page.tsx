'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function ShortlistPage() {
  const { data: shortlist, refetch } = api.founder.getMyShortlist.useQuery()

  const removeFromShortlist = api.founder.removeFromShortlist.useMutation({
    onSuccess: () => {
      refetch()
      setSuccessMessage('Removed from shortlist')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const updateNote = api.founder.updateShortlistNote.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setSuccessMessage('Note updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleStartEdit = (item: any) => {
    setEditingId(item.talent_profile_id)
    setEditingNote(item.notes || '')
  }

  const handleSaveNote = (talentId: string) => {
    updateNote.mutate({
      talentId,
      notes: editingNote,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingNote('')
  }

  const handleRemove = (talentId: string) => {
    if (confirm('Remove this talent from your shortlist?')) {
      removeFromShortlist.mutate({ talentId })
    }
  }

  const getAvailabilityBadge = (avail: string) => {
    switch (avail) {
      case 'available':
        return <Badge variant="success">Available</Badge>
      case 'passive':
        return <Badge variant="secondary">Passive</Badge>
      case 'not_looking':
        return <Badge variant="outline">Not Looking</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Shortlist</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your shortlisted talent
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

      {shortlist && shortlist.length > 0 ? (
        <div className="space-y-4">
          {shortlist.map((item: any) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start gap-6">
                <Link href={`/founder/talent/${item.talent_profile_id}`}>
                  <Avatar
                    src={item.talent_profiles.photo_url}
                    alt={item.talent_profiles.name}
                    fallback={item.talent_profiles.name}
                    size="xl"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link href={`/founder/talent/${item.talent_profile_id}`}>
                        <h3 className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
                          {item.talent_profiles.name}
                        </h3>
                      </Link>
                      {item.talent_profiles.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.talent_profiles.location}
                        </p>
                      )}
                    </div>
                    {getAvailabilityBadge(item.talent_profiles.availability)}
                  </div>

                  {item.talent_profiles.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {item.talent_profiles.bio}
                    </p>
                  )}

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Your Notes</label>
                      {editingId !== item.talent_profile_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {editingId === item.talent_profile_id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNote}
                          onChange={(e) => setEditingNote(e.target.value)}
                          rows={3}
                          placeholder="Add private notes about this candidate..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNote(item.talent_profile_id)}
                            disabled={updateNote.isPending}
                          >
                            {updateNote.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={updateNote.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {item.notes || 'No notes added'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/founder/talent/${item.talent_profile_id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(item.talent_profile_id)}
                    disabled={removeFromShortlist.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your shortlist is empty
          </p>
          <Link href="/founder/talent">
            <Button>Browse Talent</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
