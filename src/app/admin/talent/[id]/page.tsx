'use client'

import { api } from '@/trpc/react'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

export default function TalentProfileEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: profile, isLoading } = api.admin.getTalentProfile.useQuery({ id: params.id })
  const updateProfile = api.admin.updateTalentProfile.useMutation({
    onSuccess: () => {
      alert('Profile updated successfully!')
      router.refresh()
    },
  })
  const updateNote = api.admin.updateInternalNote.useMutation()
  const setRating = api.admin.setInternalRating.useMutation()

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    availability: 'passive' as 'available' | 'not_looking' | 'passive',
    linkedin_url: '',
    github_url: '',
    photo_url: '',
  })

  const [internalNote, setInternalNote] = useState('')
  const [rating, setRatingValue] = useState<number | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        availability: profile.availability || 'passive',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        photo_url: profile.photo_url || '',
      })
      setInternalNote(profile.internal_notes || '')
      setRatingValue(profile.internal_rating)
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      id: params.id,
      ...formData,
      linkedin_url: formData.linkedin_url || null,
      github_url: formData.github_url || null,
      photo_url: formData.photo_url || null,
    })
  }

  const handleSaveNote = () => {
    updateNote.mutate({
      talentId: params.id,
      note: internalNote,
    })
  }

  const handleSetRating = (newRating: number | null) => {
    setRating.mutate({
      talentId: params.id,
      rating: newRating,
    })
    setRatingValue(newRating)
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8">Profile not found</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Talent Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Editing: {profile.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/talent')}>
          Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Public Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Public Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={formData.photo_url}
                  alt={formData.name}
                  fallback={formData.name}
                  size="xl"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Photo URL</label>
                  <Input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Availability *</label>
                  <Select
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.value as any,
                      })
                    }
                  >
                    <option value="available">Available</option>
                    <option value="passive">Passive</option>
                    <option value="not_looking">Not Looking</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <Input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <Input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Card>

          {/* Skills Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No skills added</p>
            )}
          </Card>

          {/* Past Roles Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            {profile.past_roles && profile.past_roles.length > 0 ? (
              <div className="space-y-4">
                {profile.past_roles.map((role: any) => (
                  <div key={role.id} className="border-l-2 border-gray-300 dark:border-gray-700 pl-4">
                    <h3 className="font-bold">{role.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{role.company_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(role.start_date).toLocaleDateString()} -{' '}
                      {role.end_date ? new Date(role.end_date).toLocaleDateString() : 'Present'}
                    </p>
                    {role.description && (
                      <p className="text-sm mt-2">{role.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No work experience added</p>
            )}
          </Card>
        </div>

        {/* Right Column - Internal Information */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Internal Notes</h2>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={6}
              placeholder="Private notes (not visible to talent or founders)..."
            />
            <Button
              onClick={handleSaveNote}
              disabled={updateNote.isPending}
              className="mt-4 w-full"
            >
              {updateNote.isPending ? 'Saving...' : 'Save Notes'}
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Internal Rating</h2>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleSetRating(star)}
                  className="text-2xl focus:outline-none"
                  disabled={setRating.isPending}
                >
                  {rating && rating >= star ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetRating(null)}
                className="mt-4"
                disabled={setRating.isPending}
              >
                Clear Rating
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tags</h2>
            {profile.tags && profile.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No tags</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
