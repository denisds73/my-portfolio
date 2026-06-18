import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { ResumeData } from '@/types/resume'

export default function Resume() {
  const [state, setState] = useState<'loading' | 'redirecting' | 'error' | 'empty'>('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isSupabaseConfigured) {
        setState('empty')
        return
      }
      try {
        const { data: row, error } = await getSupabase()
          .from('resume')
          .select('data')
          .eq('singleton', true)
          .maybeSingle()
        if (cancelled) return
        if (error) throw error
        
        const resumeData = row?.data as ResumeData | undefined
        if (resumeData?.url) {
          setState('redirecting')
          window.location.replace(resumeData.url)
        } else {
          setState('empty')
        }
      } catch {
        if (!cancelled) setState('error')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center p-6">
      <div className="text-center w-full max-w-md mx-auto">
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4 text-text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="font-mono text-sm uppercase tracking-[0.2em]">Loading résumé…</span>
          </div>
        )}
        
        {state === 'redirecting' && (
          <div className="flex flex-col items-center gap-4 text-text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="font-mono text-sm uppercase tracking-[0.2em]">Redirecting…</span>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-display text-2xl text-text-primary">Something went wrong.</p>
            <p className="text-sm text-text-secondary mb-4">
              The résumé couldn't be loaded. Please try again in a moment.
            </p>
            <Link to="/" className="text-accent hover:underline inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to portfolio
            </Link>
          </div>
        )}

        {state === 'empty' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-display text-2xl text-text-primary">Résumé coming soon.</p>
            <p className="text-sm text-text-secondary mb-4">
              A résumé link has not been set yet. Check back shortly!
            </p>
            <Link to="/" className="text-accent hover:underline inline-flex items-center gap-2 transition-colors hover:text-accent-hover">
              <ArrowLeft className="h-4 w-4" /> Back to portfolio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
