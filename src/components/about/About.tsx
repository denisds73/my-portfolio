import { useCallback, useEffect, useRef, useState } from 'react'

export default function About() {
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

  useEffect(() => () => observerRef.current?.disconnect(), [])

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
          <p className="type-subsection italic">
            I thrive where performance meets pixel-perfect design.
          </p>
        </div>

        {/* Right column — prose */}
        <div className="space-y-5">
          <p
            className={`reveal type-body ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            I'm a frontend-focused fullstack engineer with 2+ years of experience building
            data-intensive web applications. My work lives at the intersection of engineering
            precision and design sensibility. I care as much about render performance as I do
            about the spacing between elements.
          </p>
          <p
            className={`reveal type-body ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          >
            I've contributed to frontend architecture on SaaS platforms, helped ship products
            from zero at early-stage startups, and worked on component systems used across
            teams. Whether it's a real-time analytics dashboard processing millions of data
            points or a complex form workflow that needs to feel effortless, I bring the same
            obsession with craft.
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
