'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateJakarta, getCurrentPeriod } from '@/lib/utils'
import { Plus, Clock, MapPin, Users, FileText } from 'lucide-react'
import Link from 'next/link'
import ReportFeed from '@/components/reports/ReportFeed'

interface DashboardStats {
  todayReports: number
  totalReports: number
  activeProjects: number
  teamMembers?: number
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    todayReports: 0,
    totalReports: 0,
    activeProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [profile])

  const fetchDashboardStats = async () => {
    if (!profile) return

    try {
      const today = new Date().toISOString().split('T')[0]

      // Get today's reports count
      const { count: todayCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)

      // Get total reports count
      const { count: totalCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Get active projects count
      const { count: projectsCount } = await supabase
        .from('project_assignments')
        .select('projects!inner(*)', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('projects.status_active', true)

      // Get team members count (for PM/CEO)
      let teamCount = 0
      if (profile.role === 'PM' || profile.role === 'CEO') {
        const query = supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('status_pending', false)

        if (profile.role === 'PM' && profile.division_id) {
          query.eq('division_id', profile.division_id)
        }

        const { count } = await query
        teamCount = count || 0
      }

      setStats({
        todayReports: todayCount || 0,
        totalReports: totalCount || 0,
        activeProjects: projectsCount || 0,
        teamMembers: teamCount,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPeriod = getCurrentPeriod()
  const currentTime = formatDateJakarta(new Date(), 'HH:mm')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {profile?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {formatDateJakarta(new Date(), 'EEEE, dd MMMM yyyy')} • {currentTime} WIB
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.todayReports}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Clock className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.totalReports}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Proyek</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.activeProjects}
              </p>
            </div>
          </div>
        </div>

        {stats.teamMembers !== undefined && (
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tim</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.teamMembers}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/reports/new"
            className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Buat Laporan Baru</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-lg">
            <Clock className="h-5 w-5" />
            <span>Periode Saat Ini: {currentPeriod}</span>
          </div>
        </div>
      </div>

      {/* Recent Reports Feed */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Laporan Terbaru
        </h2>
        <ReportFeed limit={5} showHeader={false} />
      </div>
    </div>
  )
}