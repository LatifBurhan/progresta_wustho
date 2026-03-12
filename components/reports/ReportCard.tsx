'use client'

import { useState } from 'react'
import { formatDateJakarta, generateWhatsAppReport } from '@/lib/utils'
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2,
  Copy,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Camera
} from 'lucide-react'
import Image from 'next/image'

interface ReportCardProps {
  report: {
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
  showUser?: boolean
}

export default function ReportCard({ report, showUser = false }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const hasIssues = report.report_details.some(detail => detail.issues)
  const isOvertime = report.period === '15-17' && new Date(report.created_at).getHours() >= 16

  const handleCopyToClipboard = async () => {
    const text = generateWhatsAppReport(report, report.report_details.map(detail => ({
      project_name: `${detail.project.name} (${detail.project.client})`,
      progress: detail.progress,
      issues: detail.issues
    })))

    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      alert('Laporan berhasil disalin ke clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'Al-Wustho': return '🏢'
      case 'WFA': return '🏠'
      case 'Client Site': return '🏗️'
      default: return '📍'
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {showUser && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {report.user.name}
                </p>
                {report.user.division && (
                  <p className="text-xs text-gray-500">
                    {report.user.division.name}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{report.period}</span>
              {isOvertime && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Lembur
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{getLocationIcon(report.location)} {report.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasIssues && (
            <div className="flex items-center space-x-1 text-danger-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Kendala</span>
            </div>
          )}
          
          <button
            onClick={handleCopyToClipboard}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            title="Copy to WhatsApp"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-3 mb-4">
        {report.report_details.slice(0, expanded ? undefined : 2).map((detail, index) => (
          <div key={detail.id} className="border-l-4 border-primary-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">
                📌 {detail.project.name}
              </h4>
              <span className="text-xs text-gray-500">
                {detail.project.client}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {detail.progress}
            </p>
            
            {detail.issues && (
              <div className="bg-danger-50 border border-danger-200 rounded-md p-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-danger-800 mb-1">
                      Kendala:
                    </p>
                    <p className="text-sm text-danger-700">
                      {detail.issues}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {report.report_details.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Tampilkan lebih sedikit</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Tampilkan {report.report_details.length - 2} proyek lainnya</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Future Plan */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-900 mb-1">
          📋 Rencana Selanjutnya:
        </h5>
        <p className="text-sm text-gray-700">
          {report.future_plan}
        </p>
      </div>

      {/* Photo */}
      {report.photo_url && !imageError && (
        <div className="mb-4">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={report.photo_url}
              alt="Report photo"
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {formatDateJakarta(report.created_at, 'dd/MM/yyyy HH:mm')} WIB
        </p>
        
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}