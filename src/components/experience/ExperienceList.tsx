import { useRef, useEffect, useState } from 'react'
import { useExperience } from '@/hooks/usePortfolioData'

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export default function ExperienceList() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const { experience } = useExperience()

  if (experience.length === 0) return null

  return (
    <section ref={ref} id="experience" className="section-padding scroll-mt-20 px-6">
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
              {/* Desktop: three-column grid */}
              <div className="grid items-baseline gap-2 md:grid-cols-[1fr_1.5fr_auto] md:gap-8">
                <h3 className="type-experience-company">{exp.company}</h3>
                <p className="font-body text-[clamp(0.875rem,1vw,1rem)] text-text-secondary">
                  {exp.role}
                </p>
                <p className="type-label text-text-muted">
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </p>
              </div>

              {/* Impact description — always visible */}
              <p className="mt-3 font-body text-sm leading-relaxed text-text-muted">
                {exp.description}
              </p>
            </div>
          ))}
          {/* Bottom border */}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  )
}
