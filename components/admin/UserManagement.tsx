'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatDateJakarta } from '@/lib/utils'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  Building2,
  Plus,
  Search,
  Filter
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'Karyawan' | 'PM' | 'CEO'
  division_id: string | null
  status_pending: boolean
  created_at: string
  division?: {
    id: string
    name: string
  }
}

interface Division {
  id: string
  name: string
}

export default function UserManagement() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDivisionModal, setShowDivisionModal] = useState(false)
  const [newDivisionName, setNewDivisionName] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchDivisions()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          division:divisions(id, name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .order('name')

      if (error) throw error
      setDivisions(data || [])
    } catch (error) {
      console.error('Error fetching divisions:', error)
    }
  }

  const approveUser = async (userId: string, role: string, divisionId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          status_pending: false,
          role,
          division_id: divisionId || null
        })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
      alert('Pengguna berhasil disetujui!')
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Gagal menyetujui pengguna')
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
      setEditingUser(null)
      alert('Pengguna berhasil diperbarui!')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Gagal memperbarui pengguna')
    }
  }

  const createDivision = async () => {
    if (!newDivisionName.trim()) return

    try {
      const { error } = await supabase
        .from('divisions')
        .insert({ name: newDivisionName.trim() })

      if (error) throw error
      
      await fetchDivisions()
      setNewDivisionName('')
      setShowDivisionModal(false)
      alert('Divisi berhasil dibuat!')
    } catch (error) {
      console.error('Error creating division:', error)
      alert('Gagal membuat divisi')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'pending' && user.status_pending) ||
                         (filterStatus === 'approved' && !user.status_pending)
    
    return matchesSearch && matchesFilter
  })

  const pendingCount = users.filter(u => u.status_pending).length
  const approvedCount = users.filter(u => !u.status_pending).length

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserX className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="approved">Sudah Disetujui</option>
            </select>
          </div>

          <button
            onClick={() => setShowDivisionModal(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Divisi</span>
          </button>
        </div>
      </div>
      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Tidak ada pengguna
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tidak ada pengguna yang sesuai dengan filter'
                : 'Belum ada pengguna yang terdaftar'
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status_pending
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-success-100 text-success-800'
                        }`}>
                          {user.status_pending ? 'Menunggu' : 'Disetujui'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.role}
                        </span>
                        {user.division && (
                          <span className="text-sm text-gray-500 flex items-center">
                            <Building2 className="w-3 h-3 mr-1" />
                            {user.division.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.status_pending ? (
                    <ApprovalForm
                      user={user}
                      divisions={divisions}
                      onApprove={approveUser}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Bergabung: {formatDateJakarta(user.created_at, 'dd/MM/yyyy HH:mm')} WIB
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          divisions={divisions}
          onSave={updateUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Division Modal */}
      {showDivisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tambah Divisi Baru
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Divisi
                </label>
                <input
                  type="text"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  className="input-field"
                  placeholder="Masukkan nama divisi"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDivisionModal(false)}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={createDivision}
                disabled={!newDivisionName.trim()}
                className="btn-primary flex-1"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Approval Form Component
function ApprovalForm({ 
  user, 
  divisions, 
  onApprove 
}: { 
  user: User
  divisions: Division[]
  onApprove: (userId: string, role: string, divisionId: string) => void 
}) {
  const [role, setRole] = useState<string>('Karyawan')
  const [divisionId, setDivisionId] = useState<string>('')

  const handleApprove = () => {
    if (!divisionId) {
      alert('Pilih divisi terlebih dahulu')
      return
    }
    onApprove(user.id, role, divisionId)
  }

  return (
    <div className="flex flex-col space-y-2 min-w-0 md:min-w-[300px]">
      <div className="flex space-x-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="Karyawan">Karyawan</option>
          <option value="PM">PM</option>
          <option value="CEO">CEO</option>
        </select>
        
        <select
          value={divisionId}
          onChange={(e) => setDivisionId(e.target.value)}
          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Pilih Divisi</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={handleApprove}
        className="bg-success-600 hover:bg-success-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
      >
        Setujui
      </button>
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  divisions, 
  onSave, 
  onClose 
}: { 
  user: User
  divisions: Division[]
  onSave: (userId: string, updates: Partial<User>) => void
  onClose: () => void
}) {
  const [role, setRole] = useState(user.role)
  const [divisionId, setDivisionId] = useState(user.division_id || '')

  const handleSave = () => {
    onSave(user.id, {
      role,
      division_id: divisionId || null
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Edit Pengguna: {user.name}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="input-field"
            >
              <option value="Karyawan">Karyawan</option>
              <option value="PM">PM</option>
              <option value="CEO">CEO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Divisi
            </label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="input-field"
            >
              <option value="">Pilih Divisi</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}