'use client'
// @ts-nocheck

import { api } from '@/trpc/react'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Combobox } from '@/components/ui/combobox'

export default function TalentProfileEditorPage() {
  const { data: profile, isLoading: profileLoading } = api.talent.getMyProfile.useQuery()
  const { data: mySkills, refetch: refetchSkills } = api.talent.getMySkills.useQuery()
  const { data: allSkills } = api.common.getAllSkills.useQuery()

  const updateProfile = api.talent.updateMyProfile.useMutation({
    onSuccess: () => {
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to update profile')
      setTimeout(() => setErrorMessage(''), 3000)
    },
  })

  const addSkill = api.talent.addSkill.useMutation({
    onSuccess: () => {
      refetchSkills()
      setSelectedSkill('')
    },
  })

  const removeSkill = api.talent.removeSkill.useMutation({
    onSuccess: () => {
      refetchSkills()
    },
  })

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    availability: 'passive' as 'available' | 'not_looking' | 'passive',
    linkedin_url: '',
    github_url: '',
    photo_url: '',
  })

  const [selectedSkill, setSelectedSkill] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (profile) {
      const p = profile as any
      setFormData({
        name: p.name || '',
        bio: p.bio || '',
        location: p.location || '',
        availability: p.availability || 'passive',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
        photo_url: p.photo_url || '',
      })
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      ...formData,
      linkedin_url: formData.linkedin_url || null,
      github_url: formData.github_url || null,
      photo_url: formData.photo_url || null,
    })
  }

  const handleAddSkill = () => {
    if (!selectedSkill) return

    // Find the skill object to get its name
    const skill = (allSkills as any)?.find((s: any) => s.id === selectedSkill)
    if (skill) {
      addSkill.mutate({ skillName: skill.name })
    }
  }

  const handleRemoveSkill = (skillId: string) => {
    removeSkill.mutate({ skillId })
  }

  if (profileLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8">Profile not found</div>
  }

  // Prepare skill options for combobox
  const skillOptions = ((allSkills as any) || []).map((skill: any) => ({
    value: skill.id,
    label: skill.name,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Your Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your information and skills to help founders discover you
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
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
        </div>

        {/* Skills Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>

            {/* Add Skill Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Add Skill</label>
              <div className="flex gap-2">
                <Combobox
                  options={skillOptions}
                  value={selectedSkill}
                  onValueChange={setSelectedSkill}
                  placeholder="Search skills..."
                  emptyMessage="No skills found"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!selectedSkill || addSkill.isPending}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Current Skills</label>
              {mySkills && mySkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mySkills.map((skill: any) => (
                    <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        disabled={removeSkill.isPending}
                        className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                        aria-label="Remove skill"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No skills added yet</p>
              )}
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Profile Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge variant={(profile as any).is_approved ? 'success' : 'warning'}>
                  {(profile as any).is_approved ? 'Approved' : 'Pending Review'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                <Badge variant="outline">
                  {formData.availability === 'available' && 'Available'}
                  {formData.availability === 'passive' && 'Passive'}
                  {formData.availability === 'not_looking' && 'Not Looking'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
