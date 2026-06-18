import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useResume } from '@/hooks/useResume'

export default function ResumeManager() {
  const { data, setData, status, lastSavedAt } = useResume()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function relativeTime(from: Date | null, now: Date): string {
    if (!from) return ''
    const diff = Math.max(0, Math.round((now.getTime() - from.getTime()) / 1000))
    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    const mins = Math.round(diff / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.round(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return from.toLocaleString()
  }

  const statusChip = (() => {
    if (status === 'loading') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading…
        </span>
      )
    }
    if (status === 'saving') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </span>
      )
    }
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          Save failed
        </span>
      )
    }
    if (status === 'saved' && lastSavedAt) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <CheckCircle2 className="h-3 w-3 text-accent" />
          Saved {relativeTime(lastSavedAt, now)}
        </span>
      )
    }
    return null
  })()

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-text-muted">
            Admin · Resume
          </p>
          <h1 className="font-display text-3xl text-text-primary">Resume Link</h1>
          <div className="mt-3 flex items-center gap-2">{statusChip}</div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-xl max-w-2xl">
        <label className="block mb-2 text-sm font-medium text-text-primary">
          Resume URL
        </label>
        <input
          type="url"
          className="w-full rounded-md border border-border bg-bg px-4 py-2 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          placeholder="https://example.com/resume.pdf"
          value={data.url || ''}
          onChange={(e) => setData({ ...data, url: e.target.value })}
        />
        <p className="mt-4 text-sm text-text-muted">
          Visitors clicking "Résumé" anywhere on your portfolio will be instantly redirected to this URL.
        </p>
      </div>
    </div>
  )
}
