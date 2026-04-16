import { useRef, useEffect, useState } from 'react'
import { useProjects } from '@/hooks/usePortfolioData'
import type { Project } from '@/types'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const isFeatured = index === 0
  const isReversed = index % 2 !== 0 && !isFeatured

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const number = String(index + 1).padStart(2, '0')

  // Grid column classes for image and text
  const imageCol = isFeatured
    ? 'col-span-12 md:[grid-column:1/9]'
    : isReversed
      ? 'col-span-12 md:[grid-column:6/13]'
      : 'col-span-12 md:[grid-column:1/8]'

  const textCol = isFeatured
    ? 'col-span-12 md:[grid-column:9/13]'
    : isReversed
      ? 'col-span-12 md:[grid-column:1/6]'
      : 'col-span-12 md:[grid-column:8/13]'

  return (
    <div
      ref={ref}
      className="[grid-column:1/-1] grid grid-cols-12 items-center gap-6 md:gap-12"
    >
      {/* Image placeholder */}
      <div
        className={`reveal group relative overflow-hidden rounded-sm bg-bg-card ${imageCol} ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.1s' }}
      >
        <div className={`${isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'} relative`}>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <span className="select-none font-display text-[clamp(2rem,4vw,4rem)] font-bold leading-none tracking-tight text-text-primary opacity-[0.04]">
              {project.title}
            </span>
          </div>
          <div className="absolute inset-0 bg-accent-glow opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </div>

      {/* Text block */}
      <div
        className={`reveal flex flex-col justify-center ${textCol} ${visible ? 'visible' : ''} ${isFeatured ? 'md:self-end md:pb-4' : ''}`}
        style={{ transitionDelay: '0.2s' }}
      >
        <p className="type-label mb-3 text-text-muted">
          {number}{isFeatured ? ' — Featured' : ''}
        </p>
        <h3 className="type-project-title">{project.title}</h3>
        <p className="type-body mt-3">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded-sm border border-border-hover px-2.5 py-1 font-body text-[0.6875rem] font-medium tracking-wide text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-5 flex gap-4">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-accent transition-opacity hover:opacity-70"
              aria-label={`View ${project.title} live (opens in new tab)`}
            >
              View Live <span aria-hidden="true">→</span>
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
  )
}

export default function WorkSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const { projects } = useProjects()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true) },
      { threshold: 0.2 },
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

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

      <div className="projects-grid mx-auto max-w-[1280px]">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
