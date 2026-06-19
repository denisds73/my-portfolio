import { motion, useReducedMotion } from 'framer-motion'

const techStack = [
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'React', slug: 'react' },
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'Express', slug: 'express' },
  { name: 'NestJS', slug: 'nestjs' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'Java', slug: 'java' },
  { name: 'Spring Boot', slug: 'springboot' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Git', slug: 'git' },
  { name: 'Docker', slug: 'docker' },
  { name: 'Redux', slug: 'redux' },
  { name: 'Zustand', slug: 'zustand' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'SQL', slug: 'mysql' },
]

export default function HeroTechCluster() {
  const prefersReducedMotion = useReducedMotion()

  // Mathematically distributed organic grid to prevent overlapping
  // Desktop: Constrained strictly to the right 35% of the screen (60-95% width)
  // Mobile: Constrained to the bottom half (50-95% height) and spread across width
  const positions = [
    { desktop: { top: '15%', left: '65%' }, mobile: { top: '60%', left: '10%' } },
    { desktop: { top: '35%', left: '62%' }, mobile: { top: '80%', left: '15%' } },
    { desktop: { top: '60%', left: '65%' }, mobile: { top: '65%', left: '30%' } },
    { desktop: { top: '85%', left: '60%' }, mobile: { top: '90%', left: '35%' } },
    { desktop: { top: '10%', left: '75%' }, mobile: { top: '55%', left: '50%' } },
    { desktop: { top: '45%', left: '72%' }, mobile: { top: '75%', left: '55%' } },
    { desktop: { top: '65%', left: '78%' }, mobile: { top: '85%', left: '70%' } },
    { desktop: { top: '90%', left: '74%' }, mobile: { top: '60%', left: '75%' } },
    { desktop: { top: '20%', left: '85%' }, mobile: { top: '95%', left: '85%' } },
    { desktop: { top: '50%', left: '82%' }, mobile: { top: '70%', left: '90%' } },
    { desktop: { top: '75%', left: '88%' }, mobile: { top: '50%', left: '20%' } },
    { desktop: { top: '95%', left: '85%' }, mobile: { top: '55%', left: '85%' } },
    { desktop: { top: '15%', left: '95%' }, mobile: { top: '80%', left: '5%' } },
    { desktop: { top: '40%', left: '92%' }, mobile: { top: '85%', left: '50%' } },
    { desktop: { top: '60%', left: '96%' }, mobile: { top: '75%', left: '95%' } },
    { desktop: { top: '85%', left: '94%' }, mobile: { top: '95%', left: '25%' } },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .tech-icon-cluster[style*="--mobile-top"] {
            top: var(--mobile-top) !important;
            left: var(--mobile-left) !important;
          }
        }
      `}} />

      <div className="relative mx-auto h-full w-full max-w-[1280px]">
        {techStack.map((tech, i) => (
          <motion.div
            key={tech.name}
            className="tech-icon-cluster absolute"
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { y: [0, -8, 0], opacity: 1 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 3, delay: 0.5 + i * 0.1 }
                : {
                    y: {
                      duration: 8 + (i % 4),
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.2,
                    },
                    opacity: { 
                      duration: 3, 
                      ease: "easeOut",
                      delay: 0.5 + i * 0.1 
                    },
                  }
            }
            style={{
              '--desktop-top': positions[i].desktop.top,
              '--desktop-left': positions[i].desktop.left,
              '--mobile-top': positions[i].mobile.top,
              '--mobile-left': positions[i].mobile.left,
              top: 'var(--desktop-top)',
              left: 'var(--desktop-left)',
            } as any}
          >
            {/* 
              PRO MAX TECHNIQUE:
              Zero color is applied here. Instead, we use backdrop-filter to brighten 
              and saturate the pixels directly behind the div. Then we mask that filter 
              with the SVG logo. The result is an icon that perfectly inherits the 
              background's exact color at that coordinate without ever looking gray.
            */}
            <div
              className="w-4 h-4 md:w-6 md:h-6"
              style={{
                backdropFilter: 'brightness(3) saturate(2)',
                WebkitBackdropFilter: 'brightness(3) saturate(2)',
                WebkitMaskImage: `url(https://cdn.simpleicons.org/${tech.slug})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(https://cdn.simpleicons.org/${tech.slug})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              } as any}
            />
          </motion.div>
        ))}

        {/* Subtle gradient overlay to blend edges completely */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg)_100%)] pointer-events-none" />
      </div>
    </div>
  )
}
