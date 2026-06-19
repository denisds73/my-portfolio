import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AnimatedLogoProps {
  className?: string
  layoutId?: string
  animatePaths?: boolean
}

/*
 * Typographic Grid:
 *   Ascender:    y = 0
 *   i-dot:       y = 6
 *   X-height:    y = 12
 *   Midline:     y = 21
 *   Baseline:    y = 30
 *   X-height span: 18 units
 *   Bowl radius: 9 (half x-height → perfect circle)
 *   Stroke:      2
 *
 * Letter positions (x):
 *   d:  bowl cx=11 r=9, stem x=20     (x: 2–20)       width 18
 *   e:  bowl cx=34 r=9, crossbar      (x: 25–43)      width 18   gap 5
 *   n:  stems x=48 & x=62, shoulder   (x: 48–62)      width 14   gap 5
 *   i:  stem x=67, dot                (x: 67)         width 0    gap 5
 *   s:  bezier x=72–84                (x: 72–84)      width 12   gap 5
 *   .:  dot x=88                      (x: 88)         gap 4
 *
 * Verified visually in logo_audit.html workshop alongside
 * Plus Jakarta Sans 800 reference.
 */

export default function AnimatedLogo({ className, layoutId, animatePaths = true }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  // Skip drawing animation if reduced motion is enabled OR we explicitly disable it
  const skipDraw = !!prefersReducedMotion || !animatePaths

  // Orchestrate staggered drawing
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: { staggerChildren: skipDraw ? 0 : 0.08, delayChildren: skipDraw ? 0 : 0.15 }
    }
  }

  // Stroke-drawing animation for paths
  const draw: Variants = {
    initial: { pathLength: skipDraw ? 1 : 0, opacity: skipDraw ? 1 : 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: skipDraw ? 0 : 1, ease: 'easeInOut' }
    }
  }

  // Pop-in animation for dots (circles)
  const pop: Variants = {
    initial: { scale: skipDraw ? 1 : 0, opacity: skipDraw ? 1 : 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: skipDraw ? 0 : 0.35, ease: 'easeOut' }
    }
  }

  const s = {
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    variants: draw
  }

  return (
    <motion.div
      layoutId={layoutId}
      transition={{ 
        layout: { type: "spring", bounce: 0, duration: 0.8 } 
      }}
      className={cn('relative flex items-center', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="initial"
      animate="animate"
      aria-label="Denis logo"
      role="img"
    >
      <svg
        viewBox="-1 -3 96 38"
        className="h-full w-auto overflow-visible text-text-primary transition-colors duration-300 hover:text-accent"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g variants={containerVariants}>

          {/* ── d ── */}
          {/* Stem: ascender (y=0) to baseline (y=30) at right tangent of bowl */}
          <motion.path d="M 20,0 L 20,30" {...s} />
          {/* Bowl: full circle, cx=11, cy=21, r=9 — drawn as two semicircular arcs */}
          <motion.path d="M 20,21 A 9,9 0 1,0 2,21 A 9,9 0 1,0 20,21" {...s} />

          {/* ── e ── */}
          {/* Crossbar at midline + 290° arc with opening at ~5 o'clock */}
          <motion.path d="M 25,21 L 43,21" {...s} />
          <motion.path d="M 43,21 A 9,9 0 1,0 40.89,26.78" {...s} />

          {/* ── n ── */}
          {/* Left stem: x-height to baseline */}
          <motion.path d="M 48,12 L 48,30" {...s} />
          {/* Shoulder: narrowed to 14 units (48→62), arch peaks at x-height */}
          {/* Math: peak = (21 + 3×9 + 3×9 + 21)/8 = 12 ✓ */}
          <motion.path d="M 48,21 C 48,9 62,9 62,21 L 62,30" {...s} />

          {/* ── i ── */}
          {/* Stem */}
          <motion.path d="M 67,12 L 67,30" {...s} />
          {/* Dot: small circle above x-height */}
          <motion.circle cx={67} cy={6} r={1.6} fill="currentColor" stroke="none" variants={pop} />

          {/* ── s ── */}
          {/* 3-segment flowing S-curve (72–84, width 12) */}
          {/* Crossover center verified: x=(72+3×72+3×84+84)/8=78, y=(16.5+3×21+3×21+25.5)/8=21 ✓ */}
          <motion.path
            d="M 83,13.5 C 84,12 72,12 72,16.5 C 72,21 84,21 84,25.5 C 84,30 72,30 73,28.5"
            {...s}
          />

          {/* ── . ── */}
          {/* Accent-colored period at baseline */}
          <motion.circle cx={88} cy={28.5} r={1.6} fill="var(--color-accent)" stroke="none" variants={pop} />

        </motion.g>
      </svg>

      {/* Hover glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-accent/20 blur-xl transition-all duration-500"
      />
    </motion.div>
  )
}
