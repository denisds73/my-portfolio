import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'

export default function About() {
  const prefersReducedMotion = useReducedMotion()

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="min-h-[100dvh] flex items-center px-6"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={container}
        className="w-full mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[2fr_3fr] md:gap-20"
      >
        {/* Left column — label + pull quote, offset down on desktop */}
        <div className="md:mt-16">
          <motion.h2 id="about-heading" variants={item} className="type-label mb-8">
            About
          </motion.h2>
          <motion.p variants={item} className="type-subsection italic">
            I thrive where performance meets pixel-perfect design.
          </motion.p>
        </div>

        {/* Right column — prose */}
        <div className="space-y-5 max-w-prose">
          <motion.p variants={item} className="type-body">
            I'm a frontend-focused fullstack engineer with 2+ years of experience building
            data-intensive web applications. My work lives at the intersection of engineering
            precision and design sensibility. I care as much about render performance as I do
            about the spacing between elements.
          </motion.p>
          <motion.p variants={item} className="type-body">
            I've contributed to frontend architecture on SaaS platforms, helped ship products
            from zero at early-stage startups, and worked on component systems used across
            teams. Whether it's a real-time analytics dashboard processing millions of data
            points or a complex form workflow that needs to feel effortless, I bring the same
            obsession with craft.
          </motion.p>
          <motion.p variants={item} className="type-body">
            I believe every interaction should feel considered, every data point should be
            accessible, and every page should load in an instant. When I'm not building, I'm
            exploring new tools and pushing the boundaries of what's possible on the web.
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
