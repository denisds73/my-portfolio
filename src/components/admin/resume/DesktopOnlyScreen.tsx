import { Link } from 'react-router-dom'
import { ArrowLeft, Monitor } from 'lucide-react'

interface Props {
  kicker?: string
  heading?: string
  body?: string
  showBackLink?: boolean
}

export default function DesktopOnlyScreen({
  kicker = 'Best on desktop',
  heading = 'Step up to a bigger canvas.',
  body = 'The résumé builder runs on seven interactive panels, drag-to-reorder entries, and a live side-by-side preview. It needs real estate to breathe — open this page on a laptop or desktop to continue.',
  showBackLink = true,
}: Props) {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,90,54,0.16), transparent 55%), radial-gradient(circle at 80% 75%, rgba(255,90,54,0.08), transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Monitor className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>

        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-text-muted">
          · {kicker} ·
        </p>

        <h1 className="font-display text-3xl leading-[1.1] tracking-tight text-text-primary sm:text-[2.25rem]">
          {heading}
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-text-secondary">
          {body}
        </p>

        {showBackLink && (
          <div className="mt-10">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 border-b border-border pb-1 font-body text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to portfolio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
