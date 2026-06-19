import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useSkills } from '@/hooks/usePortfolioData'

export default function SkillsSection() {
  const prefersReducedMotion = useReducedMotion()
  const { skills } = useSkills()

  if (skills.length === 0) return null

  // Group by category, preserve sort order within each
  const categoryOrder = ['Languages', 'Frontend', 'Backend', 'Tools']
  const grouped = new Map<string, string[]>()

  for (const skill of skills) {
    const cat = skill.category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(skill.name)
  }

  // Sort categories: known order first, then any extras
  const sortedCategories = [
    ...categoryOrder.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !categoryOrder.includes(c)),
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
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
    <section id="skills" className="section-padding scroll-mt-20 px-6">
      <div className="mx-auto max-w-[1280px]">
        
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={itemVariants}
          className="type-section-title mb-14"
        >
          Tech I Work With
        </motion.h2>

        <motion.div 
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={containerVariants}
        >
          {sortedCategories.map((category) => (
            <motion.div key={category} variants={itemVariants}>
              <h3 className="type-label-accent mb-5">{category}</h3>
              
              <ul className="flex flex-wrap gap-2">
                {grouped.get(category)!.map((name) => (
                  <li
                    key={name}
                    className="rounded-md border border-border/50 bg-bg-surface/50 px-3 py-1.5 font-body text-[0.8125rem] tracking-wide text-text-primary backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent hover:bg-accent/10 hover:text-accent hover:shadow-sm"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
