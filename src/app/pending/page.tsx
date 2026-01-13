'use client'

import { LogoutButton } from '@/components/auth/logout-button'

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-3xl font-bold">Account Pending Approval</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your account has been created successfully. However, you need to be invited by an administrator to access the platform.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Please contact the Pebblebed Current team to request access as either:
        </p>
        <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
          <li>• <strong>Talent</strong> - To create and manage your profile</li>
          <li>• <strong>Founder</strong> - To browse and connect with talent</li>
        </ul>
        <div className="pt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
