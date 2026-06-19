import { useEffect, useState, useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SplashContext } from '@/App'

export default function Hero() {
  const [cueVisible, setCueVisible] = useState(true)
  const prefersReducedMotion = useReducedMotion()
  const showSplash = useContext(SplashContext)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setCueVisible(false)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const element = document.querySelector(id)
    if (element) {
      const offset = 84 // navbar height
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  const opticalContainer = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.15, delayChildren: prefersReducedMotion ? 0 : 0.2 } },
  }

  const opticalItem = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, filter: 'blur(12px)', y: 8 },
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.3 : 1.2, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-6">

      <motion.div
        id="hero-content"
        variants={opticalContainer}
        initial="hidden"
        animate={showSplash ? "hidden" : "show"}
        className="relative z-10 mx-auto w-full max-w-[1280px] md:pl-[10%]"
      >

        <motion.h1 variants={opticalItem} className="type-hero">
          Denis
          <span className="sr-only"> — Frontend-Focused Fullstack Engineer</span>
        </motion.h1>

        <motion.p
          variants={opticalItem}
          aria-hidden="true"
          className="type-body-lead mt-2 text-text-muted"
        >
          Frontend-Focused Fullstack Engineer
        </motion.p>

        <motion.p
          variants={opticalItem}
          className="mt-5 max-w-md font-body text-[clamp(1rem,1.5vw,1.25rem)] font-light leading-relaxed text-text-secondary"
        >
          Building where data meets design.
        </motion.p>

        <motion.div variants={opticalItem} className="mt-10 flex items-center gap-6">
          <a
            href="#work"
            onClick={(e) => { e.preventDefault(); scrollTo('#work'); }}
            className="cursor-pointer font-body text-sm tracking-[0.08em] uppercase text-accent transition-opacity hover:opacity-70"
          >
            View Work <span aria-hidden="true">→</span>
          </a>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollTo('#contact'); }}
            className="cursor-pointer font-body text-sm tracking-[0.08em] uppercase text-text-muted transition-colors hover:text-text-primary"
          >
            Get in Touch
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        animate={{ opacity: cueVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="scroll-cue" />
      </motion.div>
    </section>
  )
}
