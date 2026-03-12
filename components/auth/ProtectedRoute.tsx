'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'Karyawan' | 'PM' | 'CEO'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (!profile) {
        return
      }

      if (profile.status_pending) {
        router.push('/pending-approval')
        return
      }

      if (requiredRole && profile.role !== requiredRole && profile.role !== 'CEO') {
        router.push('/dashboard')
        return
      }
    }
  }, [user, profile, loading, router, requiredRole])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || !profile) {
    return <LoadingSpinner />
  }

  if (profile.status_pending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Menunggu Persetujuan
          </h2>
          <p className="text-gray-600 max-w-md">
            Akun Anda sedang menunggu persetujuan dari PM/HRD. 
            Silakan hubungi administrator untuk mempercepat proses persetujuan.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}