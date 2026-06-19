import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useExperience } from '@/hooks/usePortfolioData'

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export default function ExperienceList() {
  const prefersReducedMotion = useReducedMotion()
  const { experience } = useExperience()

  if (experience.length === 0) return null

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.15,
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  }

  return (
    <section id="experience" aria-labelledby="experience-heading" className="section-padding scroll-mt-20 px-6">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={itemVariants} className="type-label mb-4">Experience</motion.p>
          <motion.h2 variants={itemVariants} id="experience-heading" className="type-section-title mb-12">
            Where I've Worked
          </motion.h2>
        </motion.div>

        <motion.ul 
          className="list-none"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {experience.map((exp) => (
            <motion.li
              key={exp.id}
              variants={itemVariants}
              className="group border-t border-border py-8 transition-colors hover:border-accent/50 md:py-12"
            >
              <article className="grid gap-6 md:grid-cols-[1fr_2.5fr] md:gap-12">
                <div className="flex flex-col gap-1 md:pt-1">
                  <h4 className="font-display text-base font-semibold text-accent transition-colors group-hover:text-accent/80">{exp.company}</h4>
                  <p className="type-label text-text-muted">
                    <time dateTime={exp.start_date}>{formatDate(exp.start_date)}</time>
                    <span className="sr-only"> to </span>
                    {exp.end_date ? (
                      <time dateTime={exp.end_date}>{formatDate(exp.end_date)}</time>
                    ) : 'Present'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-xl font-bold tracking-tight text-text-primary">{exp.role}</h3>
                  <div className="max-w-[65ch] font-body text-[0.9375rem] leading-relaxed text-text-muted">
                    {exp.description.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              </article>
            </motion.li>
          ))}
          <motion.li variants={itemVariants} className="border-t border-border" aria-hidden="true" />
        </motion.ul>
      </div>
    </section>
  )
}
