import { motion } from 'framer-motion'
import { Section } from '@/components/layout'
import { SectionHeading } from '@/components/ui'
import { placeholderSkills } from '@/data/placeholder'

export default function SkillsSection() {
  const skills = placeholderSkills
  const categories = Array.from(new Set(skills.map((s) => s.category)))

  return (
    <Section id="skills">
      <SectionHeading
        label="// skills"
        title="Tech Stack"
        description="Technologies I use to bring ideas to life."
      />

      <div className="grid gap-10 md:grid-cols-3">
        {categories.map((category, catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          >
            <h3 className="mb-6 font-mono text-sm font-medium text-accent">{category}</h3>
            <div className="space-y-4">
              {skills
                .filter((s) => s.category === category)
                .map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm text-text-primary">{skill.name}</span>
                      <span className="font-mono text-xs text-text-muted">{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
