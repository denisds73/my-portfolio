import { useCallback, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileUp,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { downloadUrl, formatBytes, viewUrl } from '@/lib/resumePublish'
import type { PublishedResumeMeta } from '@/lib/resumePublish'
import type { UseResumePublishReturn } from '@/hooks/useResumePublish'

interface Props {
  publishState: UseResumePublishReturn
}

function relative(date: string): string {
  const from = new Date(date).getTime()
  const diff = Math.max(0, Math.round((Date.now() - from) / 1000))
  if (diff < 60) return 'just now'
  const mins = Math.round(diff / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PublishCard({ publishState }: Props) {
  const { status, error, published, publish, unpublish } = publishState
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState(false)

  const isBusy = status === 'uploading' || status === 'loading'

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      setLocalError(null)
      try {
        await publish(file)
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : 'Upload failed.')
      }
    },
    [publish],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const openPicker = () => fileInputRef.current?.click()

  const errMessage = localError || error

  return (
    <section
      aria-labelledby="resume-publish-heading"
      className="mb-8 overflow-hidden rounded-xl border border-border bg-surface/30"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-text-muted">
            Publish
          </span>
          <h2
            id="resume-publish-heading"
            className="font-display text-[1.05rem] text-text-primary"
          >
            Visitor download
          </h2>
        </div>
        {published ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-[0.65rem] font-medium text-accent">
            <CheckCircle2 className="h-3 w-3" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[0.65rem] text-text-muted">
            Not published
          </span>
        )}
      </header>

      <div className="p-5">
        {published ? (
          <PublishedView
            published={published}
            isBusy={isBusy}
            confirmUnpublish={confirmUnpublish}
            onUnpublishRequest={() => setConfirmUnpublish(true)}
            onUnpublishCancel={() => setConfirmUnpublish(false)}
            onUnpublishConfirm={async () => {
              try {
                await unpublish()
                setConfirmUnpublish(false)
              } catch {
                // error state handled by hook
              }
            }}
            onReplace={openPicker}
          />
        ) : (
          <UnpublishedView
            dragOver={dragOver}
            isBusy={isBusy}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={openPicker}
          />
        )}

        {errMessage && (
          <p
            role="alert"
            className="mt-4 inline-flex items-start gap-2 text-[0.8125rem] text-red-400"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {errMessage}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </section>
  )
}

function UnpublishedView({
  dragOver,
  isBusy,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  dragOver: boolean
  isBusy: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
}) {
  return (
    <>
      <p className="mb-3 text-[0.8125rem] leading-relaxed text-text-secondary">
        Visitors on <span className="font-mono text-text-primary">/resume</span>{' '}
        download the PDF you upload here. Generate it with{' '}
        <span className="text-text-primary">Download PDF</span> above, then drop
        that file below.
      </p>
      <button
        type="button"
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={isBusy}
        className={cn(
          'group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border bg-background/40 hover:border-accent/60 hover:bg-accent/5',
          isBusy && 'cursor-wait opacity-60',
        )}
      >
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        ) : (
          <UploadCloud
            className={cn(
              'h-6 w-6 transition-colors',
              dragOver ? 'text-accent' : 'text-text-muted group-hover:text-accent',
            )}
          />
        )}
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-body text-sm text-text-primary">
            Drop your PDF here, or click to choose
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">
            PDF · up to 10 MB
          </span>
        </div>
      </button>
    </>
  )
}

function PublishedView({
  published,
  isBusy,
  confirmUnpublish,
  onUnpublishRequest,
  onUnpublishCancel,
  onUnpublishConfirm,
  onReplace,
}: {
  published: PublishedResumeMeta
  isBusy: boolean
  confirmUnpublish: boolean
  onUnpublishRequest: () => void
  onUnpublishCancel: () => void
  onUnpublishConfirm: () => void | Promise<void>
  onReplace: () => void
}) {
  const viewHref = viewUrl(published.path)
  const downloadHref = downloadUrl(published.path, published.fileName)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-body text-sm text-text-primary">
          <FileUp className="h-3.5 w-3.5 text-accent" />
          <span className="truncate" title={published.fileName}>
            {published.fileName}
          </span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">
          <span>{formatBytes(published.fileSize)}</span>
          <span aria-hidden="true">·</span>
          <span>Published {relative(published.publishedAt)}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.75rem]">
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-text-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </a>
          <a
            href={downloadHref}
            className="inline-flex items-center gap-1 text-text-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Download copy
          </a>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <button
          type="button"
          onClick={onReplace}
          disabled={isBusy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-[0.8125rem] font-medium text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          Replace PDF
        </button>

        {confirmUnpublish ? (
          <div className="flex items-center gap-2 text-[0.75rem]">
            <span className="text-text-secondary">Unpublish?</span>
            <button
              type="button"
              onClick={onUnpublishConfirm}
              disabled={isBusy}
              className="cursor-pointer rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[0.7rem] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Yes, remove
            </button>
            <button
              type="button"
              onClick={onUnpublishCancel}
              disabled={isBusy}
              className="cursor-pointer rounded-md px-2 py-1 text-[0.7rem] text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUnpublishRequest}
            disabled={isBusy}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-body text-[0.75rem] text-text-secondary transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3 w-3" />
            Unpublish
          </button>
        )}
      </div>
    </div>
  )
}
