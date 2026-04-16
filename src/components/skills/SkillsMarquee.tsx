import { useRef, useEffect, useState, useCallback } from 'react'
import { useSkills } from '@/hooks/usePortfolioData'

export default function SkillsSection() {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 },
    )
    observerRef.current.observe(node)
  }, [])

  useEffect(() => {
    return () => { observerRef.current?.disconnect() }
  }, [])

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

  return (
    <section ref={sectionRef} id="skills" className="section-padding scroll-mt-20 px-6">
      <div className="mx-auto max-w-[1280px]">
        <p className={`reveal type-label mb-4 ${visible ? 'visible' : ''}`}>Technologies</p>
        <h2
          className={`reveal type-section-title mb-14 ${visible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          Tech I Work With
        </h2>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {sortedCategories.map((category, catIdx) => (
            <div
              key={category}
              className={`reveal ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: `${0.15 + catIdx * 0.08}s` }}
            >
              <p className="type-label-accent mb-5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {grouped.get(category)!.map((name) => (
                  <span
                    key={name}
                    className="rounded-sm border border-border-hover px-3 py-1.5 font-body text-[0.8125rem] tracking-wide text-text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
