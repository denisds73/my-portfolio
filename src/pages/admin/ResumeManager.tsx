import { useEffect, useRef, useState } from 'react'
import { Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { useResume } from '@/hooks/useResume'
import PersonalInfoEditor from '@/components/admin/resume/PersonalInfoEditor'
import SummaryEditor from '@/components/admin/resume/SummaryEditor'
import ExperienceEditor from '@/components/admin/resume/ExperienceEditor'
import EducationEditor from '@/components/admin/resume/EducationEditor'
import SkillsEditor from '@/components/admin/resume/SkillsEditor'
import ProjectsEditor from '@/components/admin/resume/ProjectsEditor'
import CertificationsEditor from '@/components/admin/resume/CertificationsEditor'
import ResumePreview from '@/components/admin/resume/ResumePreview'
import ResumeDocument from '@/components/admin/resume/ResumeDocument'
import { pdfFileName } from '@/lib/resumeFormat'
import { RESUME_PRINT_PAGE_STYLE } from '@/lib/resumePrintStyle'

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

export default function ResumeManager() {
  const { data, setData, status, lastSavedAt } = useResume()
  const [now, setNow] = useState(() => new Date())
  const printRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: pdfFileName(data.personal).replace(/\.pdf$/, ''),
    pageStyle: RESUME_PRINT_PAGE_STYLE,
  })

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
          Save failed — changes stored locally
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
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
        Draft
      </span>
    )
  })()

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-text-muted">
            Admin · Resume
          </p>
          <h1 className="font-display text-3xl text-text-primary">Resume Builder</h1>
          <div className="mt-3 flex items-center gap-2">{statusChip}</div>
        </div>
        <button
          type="button"
          onClick={() => handlePrint()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <div className="space-y-6">
          <PersonalInfoEditor
            value={data.personal}
            onChange={(personal) => setData((d) => ({ ...d, personal }))}
          />
          <SummaryEditor
            value={data.summary}
            onChange={(summary) => setData((d) => ({ ...d, summary }))}
          />
          <SkillsEditor
            value={data.skills}
            onChange={(skills) => setData((d) => ({ ...d, skills }))}
          />
          <ExperienceEditor
            value={data.experience}
            onChange={(experience) => setData((d) => ({ ...d, experience }))}
          />
          <ProjectsEditor
            value={data.projects}
            onChange={(projects) => setData((d) => ({ ...d, projects }))}
          />
          <EducationEditor
            value={data.education}
            onChange={(education) => setData((d) => ({ ...d, education }))}
          />
          <CertificationsEditor
            value={data.certifications}
            onChange={(certifications) => setData((d) => ({ ...d, certifications }))}
          />
        </div>
        <aside className="xl:sticky xl:top-8 xl:h-[calc(100vh-4rem)] xl:overflow-y-auto">
          <ResumePreview data={data} />
        </aside>
      </div>

      {/* Off-screen print target — renders at true 8.5in size */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '8.5in',
        }}
      >
        <div ref={printRef}>
          <ResumeDocument data={data} />
        </div>
      </div>
    </div>
  )
}
