import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { emptyResume, type ResumeData } from '@/types/resume'

const LOCAL_STORAGE_KEY = 'resume:draft'
const DEBOUNCE_MS = 800

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error'

export interface UseResumeReturn {
  data: ResumeData
  setData: (updater: ResumeData | ((prev: ResumeData) => ResumeData)) => void
  status: Status
  lastSavedAt: Date | null
  reload: () => Promise<void>
}

function readLocalDraft(): ResumeData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ResumeData
    return { ...emptyResume(), ...parsed }
  } catch {
    return null
  }
}

function writeLocalDraft(data: ResumeData) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

export function useResume(): UseResumeReturn {
  const [data, setDataState] = useState<ResumeData>(() => readLocalDraft() ?? emptyResume())
  const [status, setStatus] = useState<Status>('loading')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoaded = useRef(false)

  const loadFromServer = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('idle')
      hasLoaded.current = true
      return
    }
    try {
      const { data: row, error } = await getSupabase()
        .from('resume')
        .select('*')
        .eq('singleton', true)
        .maybeSingle()
      if (error) throw error
      if (row && row.data) {
        const merged = { ...emptyResume(), ...(row.data as ResumeData) }
        setDataState(merged)
        writeLocalDraft(merged)
        setLastSavedAt(row.updated_at ? new Date(row.updated_at) : new Date())
        setStatus('saved')
      } else {
        setStatus('idle')
      }
    } catch {
      setStatus('error')
    } finally {
      hasLoaded.current = true
    }
  }, [])

  useEffect(() => {
    loadFromServer()
  }, [loadFromServer])

  const persist = useCallback(async (next: ResumeData) => {
    if (!isSupabaseConfigured) {
      setStatus('idle')
      return
    }
    setStatus('saving')
    try {
      const now = new Date().toISOString()
      const { error } = await getSupabase()
        .from('resume')
        .upsert(
          { singleton: true, data: next, updated_at: now },
          { onConflict: 'singleton' },
        )
      if (error) throw error
      setLastSavedAt(new Date(now))
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [])

  const setData = useCallback<UseResumeReturn['setData']>((updater) => {
    setDataState((prev) => {
      const next =
        typeof updater === 'function'
          ? (updater as (p: ResumeData) => ResumeData)(prev)
          : updater
      writeLocalDraft(next)
      if (!hasLoaded.current) return next
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setStatus('saving')
      saveTimer.current = setTimeout(() => {
        persist(next)
      }, DEBOUNCE_MS)
      return next
    })
  }, [persist])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  return { data, setData, status, lastSavedAt, reload: loadFromServer }
}
