import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import ResumeDocument from '@/components/admin/resume/ResumeDocument'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { pdfFileName } from '@/lib/resumeFormat'
import { RESUME_PRINT_PAGE_STYLE } from '@/lib/resumePrintStyle'
import { downloadUrl as resumeDownloadUrl } from '@/lib/resumePublish'
import { emptyResume, type ResumeData } from '@/types/resume'

const PAGE_WIDTH_PX = 96 * 8.5
const PAGE_HEIGHT_PX = 96 * 11

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

interface PublishedInfo {
  path: string
  fileName: string
}

export default function Resume() {
  const [data, setData] = useState<ResumeData | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [published, setPublished] = useState<PublishedInfo | null>(null)

  const frameRef = useRef<HTMLDivElement | null>(null)
  const docRef = useRef<HTMLDivElement | null>(null)
  const printRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState<number>(PAGE_HEIGHT_PX)

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
          .select('data, published_pdf_path, published_file_name')
          .eq('singleton', true)
          .maybeSingle()
        if (cancelled) return
        if (error) throw error
        if (row?.data) {
          setData({ ...emptyResume(), ...(row.data as ResumeData) })
          if (row.published_pdf_path && row.published_file_name) {
            setPublished({
              path: row.published_pdf_path as string,
              fileName: row.published_file_name as string,
            })
          } else {
            setPublished(null)
          }
          setState('ready')
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

  useEffect(() => {
    const compute = () => {
      const frame = frameRef.current
      if (!frame) return
      const available = frame.clientWidth
      if (available === 0) return
      setScale(Math.min(1, available / PAGE_WIDTH_PX))
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (frameRef.current) ro.observe(frameRef.current)
    return () => ro.disconnect()
  }, [state])

  useEffect(() => {
    const doc = docRef.current
    if (!doc) return
    const update = () => setDocHeight(doc.scrollHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(doc)
    return () => ro.disconnect()
  }, [state])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data ? pdfFileName(data.personal).replace(/\.pdf$/, '') : 'Resume',
    pageStyle: RESUME_PRINT_PAGE_STYLE,
  })

  const onDownload = useCallback(() => handlePrint(), [handlePrint])

  const framedHeight = Math.max(PAGE_HEIGHT_PX, docHeight) * scale

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 font-body text-[0.8125rem] tracking-[0.02em] text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to portfolio
          </Link>
          <p className="hidden font-mono text-[0.7rem] uppercase tracking-[0.22em] text-text-muted sm:block">
            Résumé
          </p>
          {published ? (
            <a
              href={resumeDownloadUrl(published.path, published.fileName)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-[0.8125rem] font-medium text-background transition-colors hover:bg-accent-hover"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          ) : (
            <button
              type="button"
              onClick={onDownload}
              disabled={state !== 'ready'}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-[0.8125rem] font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 py-10">
        {state === 'loading' && (
          <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Loading résumé…</span>
          </div>
        )}

        {state === 'error' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
            <p className="font-display text-2xl text-text-primary">Something went wrong.</p>
            <p className="max-w-md text-sm text-text-secondary">
              The résumé couldn't be loaded. Please try again in a moment.
            </p>
          </div>
        )}

        {state === 'empty' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
            <p className="font-display text-2xl text-text-primary">Résumé coming soon.</p>
            <p className="max-w-md text-sm text-text-secondary">
              Check back shortly — this page will show the latest résumé.
            </p>
          </div>
        )}

        {state === 'ready' && data && (
          <div
            ref={frameRef}
            className="relative mx-auto overflow-hidden rounded-sm bg-white shadow-2xl shadow-black/60 ring-1 ring-black/5"
            style={{ height: `${framedHeight}px` }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${PAGE_WIDTH_PX}px`,
              }}
            >
              <div
                ref={docRef}
                style={{
                  width: `${PAGE_WIDTH_PX}px`,
                  minHeight: `${PAGE_HEIGHT_PX}px`,
                }}
              >
                <ResumeDocument data={data} />
              </div>
            </div>
          </div>
        )}
      </main>

      {data && (
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
      )}
    </div>
  )
}
