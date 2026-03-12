'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  getCurrentPeriod, 
  compressImage, 
  saveToLocalStorage, 
  getFromLocalStorage,
  removeFromLocalStorage 
} from '@/lib/utils'
import { 
  Plus, 
  Trash2, 
  Camera, 
  Upload, 
  MapPin, 
  Clock,
  Save,
  Send
} from 'lucide-react'

interface Project {
  id: string
  name: string
  client: string
}

interface ProjectDetail {
  project_id: string
  progress: string
  issues: string
}

interface FormData {
  period: '08-10' | '10-12' | '13-15' | '15-17'
  location: 'Al-Wustho' | 'WFA' | 'Client Site'
  future_plan: string
  projects: ProjectDetail[]
  photo: File | null
}

const DRAFT_KEY = 'report_draft'

export default function ReportForm() {
  const { profile } = useAuth()
  const router = useRouter()
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    period: getCurrentPeriod(),
    location: 'Al-Wustho',
    future_plan: '',
    projects: [{ project_id: '', progress: '', issues: '' }],
    photo: null
  })

  useEffect(() => {
    fetchAvailableProjects()
    loadDraft()
    
    // Auto-save draft every 30 seconds
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load last used location from localStorage
    const lastLocation = getFromLocalStorage('last_location')
    if (lastLocation) {
      setFormData(prev => ({ ...prev, location: lastLocation }))
    }
  }, [])

  const fetchAvailableProjects = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('project_assignments')
        .select(`
          project:projects!inner(
            id,
            name,
            client,
            status_active
          )
        `)
        .eq('user_id', profile.id)
        .eq('project.status_active', true)

      if (error) throw error

      const projects = data?.map(item => item.project) || []
      setAvailableProjects(projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const saveDraft = () => {
    const draft = {
      ...formData,
      photo: null // Don't save file in localStorage
    }
    saveToLocalStorage(DRAFT_KEY, draft)
  }

  const loadDraft = () => {
    const draft = getFromLocalStorage(DRAFT_KEY)
    if (draft) {
      setFormData(prev => ({
        ...prev,
        ...draft,
        photo: null
      }))
    }
  }

  const clearDraft = () => {
    removeFromLocalStorage(DRAFT_KEY)
  }

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { project_id: '', progress: '', issues: '' }]
    }))
  }

  const removeProject = (index: number) => {
    if (formData.projects.length > 1) {
      setFormData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }))
    }
  }

  const updateProject = (index: number, field: keyof ProjectDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setLoading(true)
        const compressedFile = await compressImage(file)
        setFormData(prev => ({ ...prev, photo: compressedFile }))
      } catch (error) {
        console.error('Error compressing image:', error)
        alert('Gagal memproses gambar')
      } finally {
        setLoading(false)
      }
    }
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('report-photos')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    // Validation
    const validProjects = formData.projects.filter(p => p.project_id && p.progress.trim())
    if (validProjects.length === 0) {
      alert('Minimal satu proyek harus diisi')
      return
    }

    if (!formData.future_plan.trim()) {
      alert('Rencana selanjutnya harus diisi')
      return
    }

    setSubmitting(true)

    try {
      // Upload photo if exists
      let photoUrl = null
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo)
      }

      // Create report
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          user_id: profile.id,
          period: formData.period,
          location: formData.location,
          future_plan: formData.future_plan,
          photo_url: photoUrl
        })
        .select()
        .single()

      if (reportError) throw reportError

      // Create report details
      const reportDetails = validProjects.map(project => ({
        report_id: report.id,
        project_id: project.project_id,
        progress: project.progress,
        issues: project.issues || null
      }))

      const { error: detailsError } = await supabase
        .from('report_details')
        .insert(reportDetails)

      if (detailsError) throw detailsError

      // Save location preference
      saveToLocalStorage('last_location', formData.location)
      
      // Clear draft
      clearDraft()

      alert('Laporan berhasil disimpan!')
      router.push('/dashboard/reports')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Gagal menyimpan laporan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const periodOptions = [
    { value: '08-10', label: '08:00 - 10:00' },
    { value: '10-12', label: '10:00 - 12:00' },
    { value: '13-15', label: '13:00 - 15:00' },
    { value: '15-17', label: '15:00 - 17:00' },
  ]

  const locationOptions = [
    { value: 'Al-Wustho', label: '🏢 Al-Wustho', icon: '🏢' },
    { value: 'WFA', label: '🏠 Work From Anywhere', icon: '🏠' },
    { value: 'Client Site', label: '🏗️ Client Site', icon: '🏗️' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Period Selection */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Periode Waktu
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, period: option.value as any }))}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                formData.period === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Selection */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Lokasi Kerja
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, location: option.value as any }))}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                formData.location === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* Project Details */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Progress Proyek
          </h3>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.projects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Proyek {index + 1}
                </h4>
                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Proyek *
                  </label>
                  <select
                    value={project.project_id}
                    onChange={(e) => updateProject(index, 'project_id', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Pilih proyek...</option>
                    {availableProjects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.client})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress Pekerjaan *
                  </label>
                  <textarea
                    value={project.progress}
                    onChange={(e) => updateProject(index, 'progress', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Jelaskan progress yang telah dicapai..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kendala (Opsional)
                  </label>
                  <textarea
                    value={project.issues}
                    onChange={(e) => updateProject(index, 'issues', e.target.value)}
                    className="input-field"
                    rows={2}
                    placeholder="Jelaskan kendala yang dihadapi (jika ada)..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Plan */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rencana Selanjutnya
        </h3>
        <textarea
          value={formData.future_plan}
          onChange={(e) => setFormData(prev => ({ ...prev, future_plan: e.target.value }))}
          className="input-field"
          rows={4}
          placeholder="Jelaskan rencana kerja untuk periode selanjutnya..."
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Foto Dokumentasi (Opsional)
        </h3>
        
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="photo-upload"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Pilih dari Galeri</span>
            </label>
            
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center space-x-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium py-3 px-4 rounded-lg cursor-pointer transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Ambil Foto</span>
            </label>
          </div>

          {formData.photo && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                File terpilih: {formData.photo.name}
              </p>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(formData.photo)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={saveDraft}
          disabled={loading}
          className="flex items-center justify-center space-x-2 btn-secondary"
        >
          <Save className="w-5 h-5" />
          <span>Simpan Draft</span>
        </button>
        
        <button
          type="submit"
          disabled={submitting || loading}
          className="flex items-center justify-center space-x-2 btn-primary flex-1"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Kirim Laporan</span>
            </>
          )}
        </button>
      </div>

      {/* Auto-save indicator */}
      <p className="text-xs text-gray-500 text-center">
        Draft otomatis tersimpan setiap 30 detik
      </p>
    </form>
  )
}