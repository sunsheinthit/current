'use client'

import { api } from '@/trpc/react'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function InviteAcceptancePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const { data: invite, isLoading, error: verifyError } = api.public.verifyInviteToken.useQuery({
    token: params.token,
  })

  const acceptInvite = api.public.acceptInvite.useMutation({
    onSuccess: () => {
      alert('Account created successfully! Please log in.')
      router.push('/auth/login')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    acceptInvite.mutate({
      token: params.token,
      password,
      name,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <p className="text-center">Verifying invite...</p>
        </Card>
      </div>
    )
  }

  if (verifyError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {verifyError?.message || 'This invite link is invalid or has expired.'}
          </p>
          <Button
            onClick={() => router.push('/')}
            className="mt-6 w-full"
            variant="outline"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <Card className="max-w-md w-full p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Pebblebed Current</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join our talent pool
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm font-medium">Invite for:</p>
          <p className="text-lg font-bold">{invite.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Must be at least 8 characters long
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={acceptInvite.isPending}
            className="w-full"
          >
            {acceptInvite.isPending ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          By creating an account, you agree to join the Pebblebed Current talent pool
        </p>
      </Card>
    </div>
  )
}
