import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '@/components/layout'
import { SectionHeading } from '@/components/ui'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import type { Project } from '@/types'
import { placeholderProjects } from '@/data/placeholder'

export default function ProjectGrid() {
  const projects = placeholderProjects
  const allTechs = Array.from(new Set(projects.flatMap((p) => p.tech_stack)))
  const [filter, setFilter] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filtered = filter ? projects.filter((p) => p.tech_stack.includes(filter)) : projects

  return (
    <Section id="projects">
      <SectionHeading
        label="// projects"
        title="Things I've Built"
        description="A selection of projects that showcase my approach to building efficient, user-centric applications."
      />

      <nav aria-label="Project filters" className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            !filter
              ? 'bg-accent text-background'
              : 'text-text-muted hover:bg-surface hover:text-text-primary'
          }`}
        >
          All
        </button>
        {allTechs.map((tech) => (
          <button
            type="button"
            key={tech}
            onClick={() => setFilter(tech)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              filter === tech
                ? 'bg-accent text-background'
                : 'text-text-muted hover:bg-surface hover:text-text-primary'
            }`}
          >
            {tech}
          </button>
        ))}
      </nav>

      <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={i} 
              onClick={setSelectedProject}
            />
          ))}
        </AnimatePresence>
      </motion.ul>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </Section>
  )
}
