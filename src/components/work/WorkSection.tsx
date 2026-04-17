import { useRef, useEffect, useState, useCallback } from 'react'
import { useProjects } from '@/hooks/usePortfolioData'
import ProjectCarousel from './ProjectCarousel'
import type { Project } from '@/types'

function yearFrom(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return String(d.getFullYear())
}

function useReveal<T extends HTMLElement>() {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const ref = useCallback((node: T | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.08 },
    )
    observerRef.current.observe(node)
  }, [])
  useEffect(() => () => observerRef.current?.disconnect(), [])
  return { ref, visible }
}

function ImageBlock({ project }: { project: Project }) {
  const images =
    project.images && project.images.length > 0
      ? project.images
      : project.thumbnail_url
        ? [project.thumbnail_url]
        : []

  if (images.length === 0) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-md border border-border bg-bg-card"
      >
        <span className="select-none px-6 text-center font-display text-[clamp(1.5rem,3vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-text-primary/[0.06]">
          {project.title}
        </span>
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg-elevated p-1.5">
      <div className="overflow-hidden rounded-sm">
        <ProjectCarousel images={images} title={project.title} />
      </div>
    </div>
  )
}

function EntryKickerRow({
  index,
  project,
}: {
  index: number
  project: Project
}) {
  const number = String(index + 1).padStart(2, '0')
  const year = yearFrom(project.created_at)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <p className="flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em]">
        <span className="text-accent">{`\u2116\u00A0${number}`}</span>
        {year && (
          <>
            <span aria-hidden="true" className="text-border-hover">
              ·
            </span>
            <span className="text-text-muted">{year}</span>
          </>
        )}
        {project.featured && (
          <>
            <span aria-hidden="true" className="text-border-hover">
              ·
            </span>
            <span className="text-accent/80">Featured</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-x-5 font-mono text-[0.7rem] uppercase tracking-[0.22em]">
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-accent transition-opacity hover:opacity-80"
            aria-label={`View ${project.title} live (opens in new tab)`}
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5">
              ↗
            </span>
            Live
          </a>
        )}
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted transition-colors hover:text-text-primary"
            aria-label={`View source for ${project.title} (opens in new tab)`}
          >
            Source
          </a>
        )}
      </div>
    </div>
  )
}

function ProjectEntry({ project, index }: { project: Project; index: number }) {
  const { ref, visible } = useReveal<HTMLElement>()
  const featured = project.featured
  const techList =
    project.tech_stack?.map((t) => t.trim()).filter(Boolean) ?? []
  const hasTech = techList.length > 0

  const TitleBlock = (
    <>
      <h3
        className={`reveal font-display font-bold leading-[1.02] tracking-[-0.02em] text-text-primary ${
          visible ? 'visible' : ''
        } ${
          featured
            ? 'text-[clamp(2.75rem,6vw,5.25rem)]'
            : 'text-[clamp(2.25rem,5vw,4.5rem)]'
        }`}
        style={{ transitionDelay: '0.12s' }}
      >
        {project.title}
      </h3>
      <p
        className={`reveal mt-5 max-w-[34ch] font-display text-[clamp(1rem,1.4vw,1.25rem)] italic leading-[1.55] text-text-secondary ${
          visible ? 'visible' : ''
        }`}
        style={{ transitionDelay: '0.2s' }}
      >
        {project.description}
      </p>
      {hasTech && (
        <p
          className={`reveal mt-8 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-text-muted ${
            visible ? 'visible' : ''
          }`}
          style={{ transitionDelay: '0.28s' }}
        >
          {techList.join(' · ')}
        </p>
      )}
    </>
  )

  return (
    <article
      ref={ref}
      className="group relative border-t border-border pt-8 md:pt-10"
    >
      <div
        className={`reveal ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.04s' }}
      >
        <EntryKickerRow index={index} project={project} />
      </div>

      {featured ? (
        <>
          <div
            className={`reveal mt-8 md:mt-10 ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.14s' }}
          >
            <ImageBlock project={project} />
          </div>
          <div className="mt-8 grid gap-x-10 md:mt-10 md:grid-cols-[7fr_5fr]">
            <div className="min-w-0">{TitleBlock}</div>
            <div aria-hidden="true" className="hidden md:block" />
          </div>
        </>
      ) : (
        <div className="mt-8 grid gap-x-10 gap-y-8 md:mt-10 md:grid-cols-[7fr_5fr] md:items-start">
          <div className="min-w-0">{TitleBlock}</div>
          <div
            className={`reveal ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.32s' }}
          >
            <ImageBlock project={project} />
          </div>
        </div>
      )}
    </article>
  )
}

export default function WorkSection() {
  const { projects } = useProjects()
  const { ref: headerRef, visible: headerVisible } = useReveal<HTMLDivElement>()

  if (projects.length === 0) return null

  return (
    <section id="work" className="section-padding scroll-mt-20 px-6">
      <div
        ref={headerRef}
        className="mx-auto mb-[clamp(48px,7vh,96px)] flex max-w-[1280px] items-end justify-between gap-6"
      >
        <div>
          <p
            className={`reveal type-label mb-4 ${headerVisible ? 'visible' : ''}`}
          >
            Work
          </p>
          <h2
            className={`reveal type-section-title ${headerVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            Selected Projects
          </h2>
        </div>
        <p
          className={`reveal hidden font-mono text-[0.72rem] uppercase tracking-[0.22em] text-text-muted md:block ${
            headerVisible ? 'visible' : ''
          }`}
          style={{ transitionDelay: '0.18s' }}
        >
          {projects.length} {projects.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[clamp(56px,8vh,120px)] border-b border-border pb-10">
        {projects.map((project, i) => (
          <ProjectEntry key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
