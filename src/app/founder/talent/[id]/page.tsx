'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TalentProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: profile, isLoading } = api.founder.getTalentProfile.useQuery({ id: params.id })
  const { data: shortlist, refetch: refetchShortlist } = api.founder.getMyShortlist.useQuery()

  const addToShortlist = api.founder.addToShortlist.useMutation({
    onSuccess: () => {
      refetchShortlist()
      setSuccessMessage('Added to shortlist!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const removeFromShortlist = api.founder.removeFromShortlist.useMutation({
    onSuccess: () => {
      refetchShortlist()
      setSuccessMessage('Removed from shortlist')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const requestIntro = api.founder.requestIntro.useMutation({
    onSuccess: () => {
      setShowIntroModal(false)
      setIntroMessage('')
      setSuccessMessage('Intro request submitted!')
      setTimeout(() => setSuccessMessage(''), 3000)
      router.push('/founder/intro-requests')
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to request intro')
      setTimeout(() => setErrorMessage(''), 3000)
    },
  })

  const [showIntroModal, setShowIntroModal] = useState(false)
  const [introMessage, setIntroMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isInShortlist = shortlist?.some(item => item.talent_profile_id === params.id)

  const handleToggleShortlist = () => {
    if (isInShortlist) {
      removeFromShortlist.mutate({ talentId: params.id })
    } else {
      addToShortlist.mutate({ talentId: params.id })
    }
  }

  const handleRequestIntro = () => {
    if (introMessage.length < 10) {
      setErrorMessage('Message must be at least 10 characters')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    requestIntro.mutate({
      talentId: params.id,
      message: introMessage,
    })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8">Profile not found</div>
  }

  return (
    <div className="space-y-8">
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

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant={isInShortlist ? 'outline' : 'default'}
            onClick={handleToggleShortlist}
            disabled={addToShortlist.isPending || removeFromShortlist.isPending}
          >
            {isInShortlist ? 'Remove from Shortlist' : 'Add to Shortlist'}
          </Button>
          <Button onClick={() => setShowIntroModal(true)}>
            Request Intro
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={profile.photo_url}
            alt={profile.name}
            fallback={profile.name}
            size="xl"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.location && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {profile.location}
                  </p>
                )}
              </div>
              {getAvailabilityBadge(profile.availability)}
            </div>
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-4">{profile.bio}</p>
            )}
            <div className="flex gap-4 mt-4">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills */}
        <div className="lg:col-span-2 space-y-6">
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
              <p className="text-gray-600 dark:text-gray-400">No skills listed</p>
            )}
          </Card>

          {/* Work Experience */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            {profile.past_roles && profile.past_roles.length > 0 ? (
              <div className="space-y-4">
                {profile.past_roles.map((role: any) => (
                  <div key={role.id} className="border-l-2 border-gray-300 dark:border-gray-700 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{role.title}</h3>
                      {!role.end_date && (
                        <Badge variant="success" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{role.company_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(role.start_date)} -{' '}
                      {role.end_date ? formatDate(role.end_date) : 'Present'}
                    </p>
                    {role.description && (
                      <p className="text-sm mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {role.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No work experience listed</p>
            )}
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                variant={isInShortlist ? 'outline' : 'default'}
                onClick={handleToggleShortlist}
                disabled={addToShortlist.isPending || removeFromShortlist.isPending}
                className="w-full"
              >
                {isInShortlist ? 'Remove from Shortlist' : 'Add to Shortlist'}
              </Button>
              <Button
                onClick={() => setShowIntroModal(true)}
                className="w-full"
              >
                Request Intro
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Intro Request Modal */}
      {showIntroModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Request Introduction</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tell us why you'd like to connect with {profile.name}. Your message will be reviewed by our team.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Message *</label>
              <Textarea
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                rows={6}
                placeholder="I'm interested in connecting with this candidate because..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters ({introMessage.length}/10)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestIntro}
                disabled={requestIntro.isPending || introMessage.length < 10}
              >
                {requestIntro.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowIntroModal(false)
                  setIntroMessage('')
                }}
                disabled={requestIntro.isPending}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
