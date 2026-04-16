import { useRef, useEffect, useState, useCallback } from 'react'
import { useExperience } from '@/hooks/usePortfolioData'

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export default function ExperienceList() {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    observerRef.current.observe(node)
  }, [])

  useEffect(() => {
    return () => { observerRef.current?.disconnect() }
  }, [])

  const { experience } = useExperience()

  if (experience.length === 0) return null

  return (
    <section ref={sectionRef} id="experience" className="section-padding scroll-mt-20 px-6">
      <div className="mx-auto max-w-[1280px]">
        <p className={`reveal type-label mb-4 ${visible ? 'visible' : ''}`}>Experience</p>
        <h2
          className={`reveal type-section-title mb-12 ${visible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          Where I've Worked
        </h2>

        <div>
          {experience.map((exp, i) => (
            <div
              key={exp.id}
              className={`reveal border-t border-border py-6 md:py-8 ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="grid items-baseline gap-2 md:grid-cols-[1fr_1.5fr_auto] md:gap-8">
                <h3 className="type-experience-company">{exp.company}</h3>
                <p className="font-body text-[clamp(0.875rem,1vw,1rem)] text-text-secondary">
                  {exp.role}
                </p>
                <p className="type-label text-text-muted">
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </p>
              </div>

              <p className="mt-3 font-body text-sm leading-relaxed text-text-muted">
                {exp.description}
              </p>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  )
}
