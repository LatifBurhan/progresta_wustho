'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Clock, Mail, Phone } from 'lucide-react'

export default function PendingApprovalPage() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto h-20 w-20 bg-yellow-500 rounded-full flex items-center justify-center">
          <Clock className="h-10 w-10 text-white" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Menunggu Persetujuan
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Akun Anda telah berhasil dibuat dan sedang menunggu persetujuan dari PM/HRD. 
            Anda akan dapat mengakses sistem setelah akun disetujui.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Langkah Selanjutnya
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-700">
                Hubungi PM atau HRD untuk mempercepat proses persetujuan
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-700">
                Berikan informasi email dan nama lengkap Anda
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-700">
                Tunggu notifikasi persetujuan melalui email
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            Kontak HRD/PM
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>hr@perusahaan.com</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+62 xxx-xxxx-xxxx</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-primary"
          >
            Periksa Status Persetujuan
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full btn-secondary"
          >
            Keluar dan Login Ulang
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Jika Anda mengalami masalah, silakan hubungi administrator sistem.
        </p>
      </div>
    </div>
  )
}