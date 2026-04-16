import { useRef, useEffect, useState, useCallback } from 'react'
import { useProjects } from '@/hooks/usePortfolioData'
import ProjectCarousel from './ProjectCarousel'
import type { Project } from '@/types'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 },
    )
    observerRef.current.observe(node)
  }, [])

  useEffect(() => {
    return () => { observerRef.current?.disconnect() }
  }, [])

  const number = String(index + 1).padStart(2, '0')

  const allImages = project.images?.length > 0
    ? project.images
    : project.thumbnail_url
      ? [project.thumbnail_url]
      : []

  return (
    <article ref={cardRef} className="group">
      {/* Screenshot frame */}
      <div
        className={`reveal overflow-hidden rounded-lg border border-border bg-[#111] p-2 md:p-3 ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.1s' }}
      >
        <div className="overflow-hidden rounded-md">
          {allImages.length > 0 ? (
            <ProjectCarousel images={allImages} title={project.title} />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-bg-card">
              <span className="select-none font-display text-[clamp(2rem,4vw,4rem)] font-bold leading-none tracking-tight text-text-primary opacity-[0.04]">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Project info */}
      <div
        className={`reveal mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8 ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.2s' }}
      >
        {/* Left: title + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-body text-xs tabular-nums tracking-wider text-text-muted">{number}</span>
            <h3 className="type-project-title">{project.title}</h3>
          </div>
          <p className="type-body mt-2 max-w-2xl">{project.description}</p>
        </div>

        {/* Right: tech + links */}
        <div className="shrink-0 md:text-right">
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-sm border border-border-hover px-2 py-0.5 font-body text-[0.625rem] font-medium tracking-wide text-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-4 md:justify-end">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-accent transition-opacity hover:opacity-70"
                aria-label={`View ${project.title} live (opens in new tab)`}
              >
                Live <span aria-hidden="true">→</span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-text-muted transition-colors hover:text-text-primary"
                aria-label={`View source for ${project.title} (opens in new tab)`}
              >
                Source
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function WorkSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const headerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true) },
      { threshold: 0.2 },
    )
    observerRef.current.observe(node)
  }, [])

  useEffect(() => {
    return () => { observerRef.current?.disconnect() }
  }, [])

  const { projects } = useProjects()

  if (projects.length === 0) return null

  return (
    <section id="work" className="section-padding scroll-mt-20 px-6">
      <div
        ref={headerRef}
        className="mx-auto mb-[clamp(40px,6vh,80px)] max-w-[1280px]"
      >
        <p className={`reveal type-label mb-4 ${headerVisible ? 'visible' : ''}`}>Work</p>
        <h2
          className={`reveal type-section-title ${headerVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          Things I've Built
        </h2>
      </div>

      <div className="mx-auto flex max-w-[960px] flex-col gap-20">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
