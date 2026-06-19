import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/usePortfolioData'
import ProjectCarousel from './ProjectCarousel'
import ProjectModal from '../projects/ProjectModal'
import type { Project } from '@/types'

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

function ProjectEntry({ project, onOpenDetails }: { project: Project; onOpenDetails: (p: Project) => void }) {
  const { ref, visible } = useReveal<HTMLElement>()
  const navigate = useNavigate()
  const featured = project.featured
  const techList =
    project.tech_stack?.map((t) => t.trim()).filter(Boolean) ?? []
  const hasTech = techList.length > 0

  const handleInteract = () => {
    if (project.detail_type === 'case_study') {
      navigate(`/case-study/${project.id}`)
    } else {
      onOpenDetails(project)
    }
  }

  return (
    <article
      ref={ref}
      className={`group relative pt-8 md:pt-10 ${
        featured
          ? 'border-l-2 border-l-accent px-6 pb-8 md:px-10 md:pb-10'
          : 'border-t border-border'
      }`}
      style={
        featured
          ? { boxShadow: 'inset 4px 0 24px -8px var(--color-accent-glow)' }
          : undefined
      }
    >
      <div className="mt-4 grid gap-x-10 gap-y-8 md:mt-6 md:grid-cols-[7fr_5fr] md:items-start">
        <div className="min-w-0">
          {featured && (
            <p
              className={`reveal mb-4 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent ${
                visible ? 'visible' : ''
              }`}
              style={{ transitionDelay: '0.04s' }}
            >
              Featured
            </p>
          )}
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
          <div
            className={`reveal mt-10 flex w-full flex-wrap items-center gap-3 ${ 
              visible ? 'visible' : ''
            }`}
            style={{ transitionDelay: '0.36s' }}
          >
            <button
              onClick={handleInteract}
              className="group/link inline-flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 font-body text-[0.8rem] tracking-[0.08em] uppercase text-text-primary transition-all hover:bg-white/10 hover:border-white/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View details for ${project.title}`}
            >
              {project.detail_type === 'case_study' ? 'Case Study' : 'Project Breakdown'}
              <span aria-hidden="true" className="inline-block transition-transform group-hover/link:translate-x-0.5">
                →
              </span>
            </button>

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-transparent px-4 py-2.5 font-body text-[0.8rem] tracking-[0.08em] uppercase text-text-muted transition-all hover:border-white/20 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`View ${project.title} live (opens in new tab)`}
              >
                Live
                <span aria-hidden="true" className="inline-block transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                  ↗
                </span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-transparent px-4 py-2.5 font-body text-[0.8rem] tracking-[0.08em] uppercase text-text-muted transition-all hover:border-white/20 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`View source for ${project.title} (opens in new tab)`}
              >
                Source
                <span aria-hidden="true" className="inline-block transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                  ↗
                </span>
              </a>
            )}
          </div>
        </div>
        <div
          className={`reveal cursor-pointer transition-transform duration-500 hover:scale-[1.02] ${visible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.32s' }}
          onClick={handleInteract}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleInteract()
            }
          }}
          aria-label={`View details for ${project.title}`}
        >
          <ImageBlock project={project} />
        </div>
      </div>
    </article>
  )
}

export default function WorkSection() {
  const { projects } = useProjects()
  const { ref: headerRef, visible: headerVisible } = useReveal<HTMLDivElement>()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Handle deep linking
  useEffect(() => {
    if (projects.length === 0) return

    const handleHashChange = () => {
      // Check if URL has ?project=id or similar logic. Actually, we use URLSearchParams
      const params = new URLSearchParams(window.location.search)
      const projectId = params.get('project')
      
      if (projectId) {
        const found = projects.find((p) => p.id === projectId)
        if (found) setSelectedProject(found)
      } else {
        setSelectedProject(null)
      }
    }

    // Initial check
    handleHashChange()

    // Listen to popstate for back button navigation
    window.addEventListener('popstate', handleHashChange)
    return () => window.removeEventListener('popstate', handleHashChange)
  }, [projects])

  // Update URL when selected project changes
  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    
    const url = new URL(window.location.href)
    if (project) {
      url.searchParams.set('project', project.id)
      window.history.pushState({}, '', url.toString())
    } else {
      url.searchParams.delete('project')
      // If we're closing, we should ideally go back instead of pushing a new state if we just opened it, 
      // but pushState/replaceState is easier. Let's just push state to keep it simple, or back if applicable.
      // Better: just push State so forward/back works predictably.
      window.history.pushState({}, '', url.toString())
    }
  }

  // Also close modal on Escape to ensure URL syncs back
  const handleClose = useCallback(() => {
    handleProjectSelect(null)
  }, [])

  if (projects.length === 0) {
    return <section id="work" className="scroll-mt-20"></section>
  }

  // Sort: featured projects first, then by sort_order
  const sorted = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return 0
  })

  return (
    <section id="work" className="section-padding scroll-mt-20 px-6">
      <div
        ref={headerRef}
        className="mx-auto mb-[clamp(48px,7vh,96px)] flex max-w-[1280px] items-end justify-between gap-6"
      >
        <div>
          <h2
            className={`reveal type-section-title ${headerVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            Projects
          </h2>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[clamp(56px,8vh,120px)] border-b border-border pb-[clamp(56px,8vh,120px)]">
        {sorted.map((project) => (
          <ProjectEntry key={project.id} project={project} onOpenDetails={handleProjectSelect} />
        ))}
      </div>

      {/* Dynamic import of ProjectModal from projects folder */}
      <ProjectModal project={selectedProject} onClose={handleClose} />
    </section>
  )
}
