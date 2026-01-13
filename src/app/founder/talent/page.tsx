'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'

export default function TalentDirectoryPage() {
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<'available' | 'not_looking' | 'passive' | ''>('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = api.founder.getTalentList.useQuery({
    search: search || undefined,
    availability: availability || undefined,
    limit,
    offset: page * limit,
  })

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value as any)
    setPage(0)
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
      <div>
        <h1 className="text-3xl font-bold">Browse Talent</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Search and discover talented individuals for your team
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, skills, or experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <Select
              value={availability}
              onChange={(e) => handleAvailabilityChange(e.target.value)}
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="passive">Passive</option>
              <option value="not_looking">Not Looking</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {data && (
            <>
              Showing {data.talent.length} of {data.total} results
            </>
          )}
        </div>
      </Card>

      {/* Talent List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading talent...</p>
        </div>
      ) : data && data.talent.length > 0 ? (
        <div className="space-y-4">
          {data.talent.map((talent: any) => (
            <Card key={talent.id} className="p-6 hover:shadow-lg transition-shadow">
              <Link href={`/founder/talent/${talent.id}`}>
                <div className="flex items-start gap-4">
                  <Avatar
                    src={talent.photo_url}
                    alt={talent.name}
                    fallback={talent.name}
                    size="xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
                          {talent.name}
                        </h3>
                        {talent.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {talent.location}
                          </p>
                        )}
                      </div>
                      {getAvailabilityBadge(talent.availability)}
                    </div>
                    {talent.bio && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                        {talent.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {talent.linkedin_url && (
                        <a
                          href={talent.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn
                        </a>
                      )}
                      {talent.github_url && (
                        <a
                          href={talent.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No talent found. Try adjusting your search criteria.
          </p>
        </Card>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
