import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'Karyawan' | 'PM' | 'CEO'
          division_id: string | null
          status_pending: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'Karyawan' | 'PM' | 'CEO'
          division_id?: string | null
          status_pending?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'Karyawan' | 'PM' | 'CEO'
          division_id?: string | null
          status_pending?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      divisions: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          client: string
          status_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client: string
          status_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client?: string
          status_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_assignments: {
        Row: {
          id: string
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          location: 'Al-Wustho' | 'WFA' | 'Client Site'
          period: '08-10' | '10-12' | '13-15' | '15-17'
          future_plan: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location: 'Al-Wustho' | 'WFA' | 'Client Site'
          period: '08-10' | '10-12' | '13-15' | '15-17'
          future_plan: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: 'Al-Wustho' | 'WFA' | 'Client Site'
          period?: '08-10' | '10-12' | '13-15' | '15-17'
          future_plan?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_details: {
        Row: {
          id: string
          report_id: string
          project_id: string
          progress: string
          issues: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          project_id: string
          progress: string
          issues?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          project_id?: string
          progress?: string
          issues?: string | null
          created_at?: string
        }
      }
    }
  }
}