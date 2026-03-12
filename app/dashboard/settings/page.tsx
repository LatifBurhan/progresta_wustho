'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { 
  User, 
  Building2, 
  Shield, 
  LogOut, 
  Smartphone,
  Download,
  Bell,
  Moon,
  Sun
} from 'lucide-react'

export default function SettingsPage() {
  const { profile, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSignOut = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await signOut()
    }
  }

  const installPWA = () => {
    // This would be handled by the PWA install prompt
    alert('Untuk menginstall aplikasi, gunakan menu "Add to Home Screen" di browser Anda')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pengaturan
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola profil dan preferensi aplikasi Anda
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profil Pengguna
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-xl">
                  {profile?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {profile?.name}
                </h3>
                <p className="text-gray-600">{profile?.email}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <Shield className="w-3 h-3 mr-1" />
                    {profile?.role}
                  </span>
                  {profile?.division && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Building2 className="w-3 h-3 mr-1" />
                      {profile.division.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Pengaturan Aplikasi
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Notifikasi</p>
                  <p className="text-sm text-gray-600">Terima notifikasi untuk laporan baru</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Mode Gelap</p>
                  <p className="text-sm text-gray-600">Gunakan tema gelap untuk aplikasi</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={installPWA}
              className="w-full flex items-center justify-center space-x-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Install Aplikasi</span>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tentang Aplikasi
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Versi Aplikasi</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Terakhir Diperbarui</span>
              <span className="font-medium">Maret 2026</span>
            </div>
            <div className="flex justify-between">
              <span>Zona Waktu</span>
              <span className="font-medium">Asia/Jakarta (GMT+7)</span>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="card">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 bg-danger-600 hover:bg-danger-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  )
}