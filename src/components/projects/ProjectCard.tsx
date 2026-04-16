import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import type { Project } from '@/types'
import { Card } from '@/components/ui'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group flex h-full flex-col">
        {project.thumbnail_url ? (
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-background">
            <img
              src={project.thumbnail_url}
              alt={project.title}
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
                  className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
              ) : null}
              {project.live_url ? (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">{project.description}</p>

          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span key={tech} className="rounded-md bg-accent-muted px-2.5 py-1 font-mono text-xs text-accent">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
