import { useRef, useEffect, useState } from 'react'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-padding scroll-mt-20 px-6"
    >
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[2fr_3fr] md:gap-20">
        {/* Left column — label + pull quote, offset down on desktop */}
        <div className={`reveal md:mt-16 ${visible ? 'visible' : ''}`}>
          <p className="type-label mb-8">About</p>
          <p className="font-display text-[clamp(1.5rem,2.5vw,2rem)] italic leading-[1.2] tracking-[-0.02em] text-text-primary">
            I thrive where performance meets pixel-perfect design.
          </p>
        </div>

        {/* Right column — prose */}
        <div className="space-y-5">
          <p
            className={`reveal type-body ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            I'm a frontend-focused fullstack engineer with over five years of experience building
            data-intensive web applications. My work lives at the intersection of engineering
            precision and design sensibility — I care as much about render performance as I do about
            the spacing between elements.
          </p>
          <p
            className={`reveal type-body ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          >
            I've led frontend architecture for SaaS platforms, shipped products from zero at
            early-stage startups, and built component systems used by multiple teams. Whether it's a
            real-time analytics dashboard processing millions of data points or a complex form
            workflow that needs to feel effortless, I bring the same obsession with craft.
          </p>
          <p
            className={`reveal type-body ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.3s' }}
          >
            I believe every interaction should feel considered, every data point should be
            accessible, and every page should load in an instant. When I'm not building, I'm
            exploring new tools and pushing the boundaries of what's possible on the web.
          </p>
        </div>
      </div>
    </section>
  )
}
