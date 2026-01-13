'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all Supabase auth data from localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })

      // Also clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key)
        }
      })

      // Clear all cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      })
    }

    // Redirect to home after a short delay
    setTimeout(() => {
      router.push('/')
      window.location.href = '/'
    }, 1000)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600 dark:text-gray-400">Clearing session data</p>
      </div>
    </div>
  )
}
