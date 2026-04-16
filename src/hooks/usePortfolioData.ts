import { useState, useEffect } from 'react'
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase'
import type { Project, Skill, Experience } from '@/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }

    getSupabase()
      .from('projects')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setProjects(data)
        setLoading(false)
      })
  }, [])

  return { projects, loading }
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }

    getSupabase()
      .from('skills')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setSkills(data)
        setLoading(false)
      })
  }, [])

  return { skills, loading }
}

export function useExperience() {
  const [experience, setExperience] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }

    getSupabase()
      .from('experience')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setExperience(data)
        setLoading(false)
      })
  }, [])

  return { experience, loading }
}
