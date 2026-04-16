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

  const isFeatured = index === 0
  const isEven = index % 2 === 0
  const number = String(index + 1).padStart(2, '0')

  const allImages = project.images?.length > 0
    ? project.images
    : project.thumbnail_url
      ? [project.thumbnail_url]
      : []

  // Staggered widths: featured = full, others alternate wide-left / wide-right
  const cardWidth = isFeatured
    ? 'md:col-span-10 md:col-start-2'
    : isEven
      ? 'md:col-span-8 md:col-start-1'
      : 'md:col-span-8 md:col-start-5'

  return (
    <div
      ref={cardRef}
      className={`col-span-12 ${cardWidth}`}
    >
      {/* Image — full width, natural proportions, no cropping */}
      <div
        className={`reveal overflow-hidden rounded-sm border border-border bg-bg-card ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.1s' }}
      >
        {allImages.length > 0 ? (
          <ProjectCarousel images={allImages} title={project.title} />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center">
            <span className="select-none font-display text-[clamp(2rem,4vw,4rem)] font-bold leading-none tracking-tight text-text-primary opacity-[0.04]">
              {project.title}
            </span>
          </div>
        )}
      </div>

      {/* Project info — directly below the image */}
      <div
        className={`reveal mt-6 ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.2s' }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="type-label text-text-muted">{number}</span>
            {isFeatured && (
              <span className="rounded-sm bg-accent-glow px-2 py-0.5 font-body text-[0.6rem] font-medium uppercase tracking-[0.1em] text-accent">
                Featured
              </span>
            )}
          </div>
          <div className="flex gap-4">
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

        <h3 className="type-project-title mt-3">{project.title}</h3>
        <p className="type-body mt-2 max-w-2xl">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded-sm border border-border-hover px-2.5 py-1 font-body text-[0.6875rem] font-medium tracking-wide text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
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

      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-x-6 gap-y-[clamp(60px,10vh,120px)]">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
