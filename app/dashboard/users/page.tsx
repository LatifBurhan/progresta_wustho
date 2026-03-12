import ProtectedRoute from '@/components/auth/ProtectedRoute'
import UserManagement from '@/components/admin/UserManagement'

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="PM">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Pengguna
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola persetujuan pengguna, role, dan divisi
          </p>
        </div>
        
        <UserManagement />
      </div>
    </ProtectedRoute>
  )
}