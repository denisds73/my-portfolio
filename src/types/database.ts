import type { ResumeData } from './resume'

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at'>
        Update: Partial<Omit<Skill, 'id' | 'created_at'>>
        Relationships: []
      }
      experience: {
        Row: Experience
        Insert: Omit<Experience, 'id' | 'created_at'>
        Update: Partial<Omit<Experience, 'id' | 'created_at'>>
        Relationships: []
      }
      resume: {
        Row: ResumeRow
        Insert: Omit<ResumeRow, 'id' | 'updated_at'> & { updated_at?: string }
        Update: Partial<Omit<ResumeRow, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Project {
  id: string
  title: string
  description: string
  long_description: string | null
  thumbnail_url: string
  images: string[]
  live_url: string | null
  github_url: string | null
  tech_stack: string[]
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Experience {
  id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string
  sort_order: number
  created_at: string
}

export interface ResumeRow {
  id: string
  singleton: boolean
  data: ResumeData
  updated_at: string
}
