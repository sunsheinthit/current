'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminTalentListPage() {
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<string>('')
  const [visible, setVisible] = useState<string>('')

  const { data, isLoading } = api.admin.getAllTalent.useQuery({
    search: search || undefined,
    availability: availability as any || undefined,
    visible: visible === 'true' ? true : visible === 'false' ? false : undefined,
    limit: 50,
    offset: 0,
  })

  const toggleVisibility = api.admin.toggleVisibility.useMutation()

  const handleToggleVisibility = async (talentId: string, currentVisible: boolean) => {
    await toggleVisibility.mutateAsync({
      talentId,
      visible: !currentVisible,
    })
    // Refetch would happen automatically with tRPC
    window.location.reload()
  }

  const availabilityColors: Record<string, 'success' | 'warning' | 'secondary'> = {
    available: 'success',
    passive: 'warning',
    not_looking: 'secondary',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Talent Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all talent profiles
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              type="text"
              placeholder="Search by name, bio, roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="passive">Passive</option>
              <option value="not_looking">Not Looking</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <Select value={visible} onChange={(e) => setVisible(e.target.value)}>
              <option value="">All</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Talent List */}
      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : data && data.talent.length > 0 ? (
          <div className="space-y-4">
            {data.talent.map((talent: any) => (
              <Card key={talent.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar
                      src={talent.photo_url}
                      alt={talent.name}
                      fallback={talent.name}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold">{talent.name}</h3>
                        <Badge variant={availabilityColors[talent.availability] || 'secondary'}>
                          {talent.availability}
                        </Badge>
                        {talent.visible_to_founders ? (
                          <Badge variant="success">Visible</Badge>
                        ) : (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {talent.location || 'Location not set'}
                      </p>
                      {talent.roles_interested && talent.roles_interested.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {talent.roles_interested.map((role: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {talent.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {talent.bio}
                        </p>
                      )}
                      {talent.internal_rating && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Rating: {'⭐'.repeat(talent.internal_rating)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link href={`/admin/talent/${talent.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(talent.id, talent.visible_to_founders)}
                      disabled={toggleVisibility.isPending}
                    >
                      {talent.visible_to_founders ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {data.talent.length} of {data.total} profiles
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No talent profiles found</p>
          </Card>
        )}
      </div>
    </div>
  )
}
