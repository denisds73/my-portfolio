import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function Hero() {
  const [cueVisible, setCueVisible] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setCueVisible(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12, delayChildren: prefersReducedMotion ? 0 : 0.2 } },
  }

  const fadeUp = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6">
      {/* Ambient glow */}
      <div className="hero-glow absolute right-[10%] top-[15%]" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto w-full max-w-[1280px] md:pl-[10%]"
      >
        <motion.p variants={fadeUp} className="type-label-accent mb-5">
          Portfolio — 2026
        </motion.p>

        <motion.h1 variants={fadeUp} className="type-hero">
          Denis
          <span className="sr-only"> — Frontend-Focused Fullstack Engineer</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          aria-hidden="true"
          className="type-body-lead mt-2 text-text-muted"
        >
          Frontend-Focused Fullstack Engineer
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-5 max-w-md font-body text-[clamp(1rem,1.5vw,1.25rem)] font-light leading-relaxed text-text-secondary"
        >
          Building where data meets design.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollTo('#work')}
            className="cursor-pointer font-body text-sm tracking-[0.08em] uppercase text-accent transition-opacity hover:opacity-70"
          >
            View Work <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            onClick={() => scrollTo('#contact')}
            className="cursor-pointer font-body text-sm tracking-[0.08em] uppercase text-text-muted transition-colors hover:text-text-primary"
          >
            Get in Touch
          </button>
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
