import { motion } from 'framer-motion'
import { Briefcase, Calendar } from 'lucide-react'
import { Section } from '@/components/layout'
import { SectionHeading } from '@/components/ui'
import { placeholderExperience } from '@/data/placeholder'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Timeline() {
  const experience = placeholderExperience

  return (
    <Section id="experience">
      <SectionHeading
        label="// experience"
        title="Where I've Worked"
        description="A timeline of my professional journey."
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

        {experience.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className={`relative mb-12 pl-8 md:w-1/2 ${i % 2 === 0 ? 'md:pl-0 md:pr-12' : 'md:ml-auto md:pl-12'}`}
          >
            <div
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background md:left-auto ${
                i % 2 === 0 ? 'md:right-0 md:translate-x-1/2' : 'md:left-0 md:-translate-x-1/2'
              }`}
            />

            <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-hover">
              <div className="mb-2 flex items-center gap-2 text-accent">
                <Briefcase className="h-4 w-4" />
                <span className="font-mono text-sm">{exp.company}</span>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-text-primary">{exp.role}</h3>
              <div className="mb-3 flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
