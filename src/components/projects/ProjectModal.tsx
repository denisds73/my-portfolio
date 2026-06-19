import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Github, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [project])

  // Focus trap & Escape key
  useEffect(() => {
    if (!project) return

    // Focus the close button initially
    setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trapping logic
      if (e.key === 'Tab') {
        if (!modalRef.current) return
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project, onClose])

  // Lock body scroll and prevent layout shift
  useEffect(() => {
    if (project) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [project])

  if (!project) return null

  // Ensure we have an array of images to display
  const images = project.images && project.images.length > 0 
    ? project.images 
    : project.thumbnail_url 
      ? [project.thumbnail_url] 
      : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextImage()
    }
    if (isRightSwipe) {
      prevImage()
    }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 20, 
      scale: prefersReducedMotion ? 1 : 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, duration: 0.5, bounce: 0 }
    },
    exit: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 20, 
      scale: prefersReducedMotion ? 1 : 0.95,
      transition: { duration: 0.2 }
    }
  }

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden glass-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Header */}
            {images.length > 0 && (
              <div 
                className="group relative flex aspect-[16/9] w-full items-center justify-center bg-black/40 sm:aspect-[21/9]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={images[currentImageIndex]}
                    alt={`Screenshot of ${project.title}`}
                    className="h-full w-full object-contain"
                  />
                </AnimatePresence>
                
                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white opacity-100 sm:opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white opacity-100 sm:opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentImageIndex(i)
                          }}
                          className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            i === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Content Padding */}
            <div className="p-6 sm:p-10">
              <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="modal-title" className="text-3xl font-bold text-text-primary">
                    {project.title}
                  </h2>
                </div>
                
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Github className="h-4 w-4" />
                      <span>Source Code</span>
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#020203] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
                {/* Left Column: Description & Highlights */}
                <div>
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Overview</h3>
                    <p className="text-base leading-relaxed text-text-secondary mb-6 whitespace-pre-wrap">
                      {project.long_description || project.description}
                    </p>

                    {project.highlights && project.highlights.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold text-text-primary mb-4 mt-8">Key Features</h3>
                        <ul className="list-inside list-disc space-y-2 text-text-secondary">
                          {project.highlights.map((highlight, idx) => (
                            <li key={idx} className="leading-relaxed">{highlight}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Tech Stack */}
                <div>
                  <div className="rounded-xl border border-white/5 bg-background/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.map((tech) => (
                        <span 
                          key={tech} 
                          className="rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 font-mono text-sm text-accent"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
