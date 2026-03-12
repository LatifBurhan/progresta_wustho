'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatDateJakarta } from '@/lib/utils'
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2,
  ChevronDown,
  Filter
} from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ReportCard from './ReportCard'

interface Report {
  id: string
  user_id: string
  location: string
  period: string
  future_plan: string
  photo_url: string | null
  created_at: string
  user: {
    name: string
    division: {
      name: string
    } | null
  }
  report_details: Array<{
    id: string
    project: {
      name: string
      client: string
    }
    progress: string
    issues: string | null
  }>
}

interface ReportFeedProps {
  limit?: number
  showHeader?: boolean
}

export default function ReportFeed({ limit, showHeader = true }: ReportFeedProps) {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState<'my' | 'division' | 'all'>('my')
  const [page, setPage] = useState(0)

  const ITEMS_PER_PAGE = limit || 10

  useEffect(() => {
    fetchReports(true)
  }, [activeTab, profile])

  const fetchReports = async (reset = false) => {
    if (!profile) return

    try {
      const currentPage = reset ? 0 : page
      const from = currentPage * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('reports')
        .select(`
          *,
          user:users!inner(
            name,
            division:divisions(name)
          ),
          report_details(
            id,
            progress,
            issues,
            project:projects(name, client)
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply filters based on active tab and user role
      if (activeTab === 'my') {
        query = query.eq('user_id', profile.id)
      } else if (activeTab === 'division' && profile.division_id) {
        query = query.eq('user.division_id', profile.division_id)
      } else if (activeTab === 'all') {
        // PM and CEO can see all, Karyawan sees all as read-only
        if (profile.role === 'Karyawan') {
          // No additional filter needed, RLS will handle visibility
        }
      }

      const { data, error } = await query

      if (error) throw error

      const newReports = data || []
      
      if (reset) {
        setReports(newReports)
        setPage(1)
      } else {
        setReports(prev => [...prev, ...newReports])
        setPage(prev => prev + 1)
      }

      setHasMore(newReports.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReports(false)
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'my': return 'Laporan Saya'
      case 'division': return 'Divisi Saya'
      case 'all': return 'Semua Divisi'
      default: return tab
    }
  }

  const canViewTab = (tab: string) => {
    if (tab === 'my') return true
    if (tab === 'division') return profile?.division_id
    if (tab === 'all') return true // RLS will handle permissions
    return false
  }

  const availableTabs = ['my', 'division', 'all'].filter(canViewTab)

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Feed Laporan
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Belum ada laporan
          </h3>
          <p className="mt-2 text-gray-600">
            {activeTab === 'my' 
              ? 'Mulai buat laporan pertama Anda'
              : 'Belum ada laporan dari tim'
            }
          </p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={reports.length}
          next={loadMore}
          hasMore={hasMore && !limit}
          loader={
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          }
          endMessage={
            !limit && (
              <div className="text-center py-4 text-gray-500">
                <p>Semua laporan telah dimuat</p>
              </div>
            )
          }
        >
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report}
                showUser={activeTab !== 'my'}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}