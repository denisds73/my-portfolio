import { motion, useReducedMotion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import type { Project } from '@/types'
import { Card } from '@/components/ui'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : index * 0.05 }}
      className="list-none"
    >
      <Card className="group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
        <article className="contents">
          {project.thumbnail_url ? (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-background">
              <img
                src={project.thumbnail_url}
                alt={project.title ? `Screenshot of ${project.title} interface` : ""}
                loading="lazy"
                decoding="async"
                width="800"
                height="450"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-accent">
                {project.title}
              </h3>
              <div className="flex items-center gap-2">
                {project.github_url ? (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.title} source code on GitHub`}
                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                ) : null}
                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${project.title} live site`}
                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>

            <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">{project.description}</p>

            {project.highlights && project.highlights.length > 0 && (
              <ul className="mb-6 ml-4 list-disc space-y-1 text-sm text-text-muted">
                {project.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="rounded-md bg-accent-muted px-2.5 py-1 font-mono text-xs text-accent">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </article>
      </Card>
    </motion.li>
  )
}
