'use client'
// @ts-nocheck

import { api } from '@/trpc/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TalentDashboardPage() {
  const { data: profile, isLoading } = api.talent.getMyProfile.useQuery()
  const { data: skills } = api.talent.getMySkills.useQuery()
  const { data: pastRoles } = api.talent.getMyPastRoles.useQuery()

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8">Profile not found</div>
  }

  // Cast profile to any to work around type issues
  const p = profile as any

  const availabilityColors: Record<string, 'success' | 'warning' | 'secondary'> = {
    available: 'success',
    passive: 'warning',
    not_looking: 'secondary',
  }

  // Calculate profile completeness
  const fieldsToCheck = [
    (profile as any).bio,
    (profile as any).location,
    (profile as any).photo_url,
    (profile as any).linkedin_url,
    (profile as any).github_url,
    skills && skills.length > 0,
    pastRoles && pastRoles.length > 0,
  ]
  const completedFields = fieldsToCheck.filter(Boolean).length
  const completeness = Math.round((completedFields / fieldsToCheck.length) * 100)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {p.name}!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your talent profile
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar
            src={p.photo_url}
            alt={p.name}
            fallback={p.name}
            size="xl"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold">{p.name}</h2>
              <Badge variant={availabilityColors[p.availability]}>
                {p.availability}
              </Badge>
              {p.visible_to_founders ? (
                <Badge variant="success">Visible to Founders</Badge>
              ) : (
                <Badge variant="outline">Not Visible</Badge>
              )}
            </div>
            {p.location && (
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                📍 {p.location}
              </p>
            )}
            {p.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{p.bio}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Completeness */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Profile Completeness</h3>
          <span className="text-lg font-bold">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completeness}%` }}
          />
        </div>
        {completeness < 100 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Complete your profile to increase visibility to founders
          </p>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills</p>
          <p className="text-3xl font-bold">{skills?.length || 0}</p>
          <Link href="/talent/profile">
            <Button variant="outline" size="sm" className="mt-4">
              Manage Skills
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Work Experience</p>
          <p className="text-3xl font-bold">{pastRoles?.length || 0}</p>
          <Link href="/talent/experience">
            <Button variant="outline" size="sm" className="mt-4">
              Add Experience
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visibility</p>
          <p className="text-lg font-bold">
            {p.visible_to_founders ? 'Active' : 'Inactive'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {p.visible_to_founders
              ? 'Founders can see your profile'
              : 'Contact admin to activate'}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/talent/profile">
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <h3 className="font-bold mb-2">Edit Profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your bio, skills, and contact information
              </p>
            </Card>
          </Link>
          <Link href="/talent/experience">
            <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <h3 className="font-bold mb-2">Manage Experience</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add or update your work history
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
