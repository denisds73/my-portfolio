import { useRef, useEffect, useState, useCallback } from 'react'
import { useSkills } from '@/hooks/usePortfolioData'

const REPEAT_COUNT = 4

function SkillItem({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap font-display text-[clamp(1.125rem,1.5vw,1.5rem)] italic tracking-[-0.01em] text-text-primary">
      {name}
      <span className="mx-8 inline-block text-accent opacity-60" aria-hidden="true">*</span>
    </span>
  )
}

export default function SkillsMarquee() {
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
  const allSkills = skills.map((s) => s.name)
  const repeated = Array.from({ length: REPEAT_COUNT }, () => allSkills).flat()

  if (allSkills.length === 0) return null

  return (
    <section ref={sectionRef} id="skills" className="section-padding scroll-mt-20 overflow-hidden">
      <div className="mx-auto mb-10 max-w-[1280px] px-6">
        <p className={`reveal type-label ${visible ? 'visible' : ''}`}>Technologies</p>
      </div>

      <div
        className={`reveal ${visible ? 'visible' : ''}`}
        style={{ transitionDelay: '0.15s' }}
      >
        <div className="overflow-hidden">
          <div className="marquee-track marquee-forward">
            {repeated.map((name, i) => (
              <SkillItem key={`${name}-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
