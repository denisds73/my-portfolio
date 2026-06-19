import { useState, useEffect, useCallback, useContext } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import AnimatedLogo from '../ui/AnimatedLogo'
import { SplashContext } from '@/App'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

const ALL_SECTION_IDS = ['about', 'work', 'skills', 'experience', 'contact']

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const prefersReducedMotion = useReducedMotion()
  const motionDuration = prefersReducedMotion ? 0 : 0.3
  const showSplash = useContext(SplashContext)

  useEffect(() => {
    const handleScroll = () => {
      const heroContent = document.getElementById('hero-content')
      if (heroContent) {
        const rect = heroContent.getBoundingClientRect()
        // Navbar is roughly 84px tall. Trigger blur when content is ~100px from top.
        setScrolled(rect.top <= 100)
      } else {
        setScrolled(window.scrollY > 80)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section tracking — scroll-position based (reliable with async sections)
  useEffect(() => {
    const mapToNav = (id: string): string => {
      if (id === 'skills' || id === 'experience') return '#work'
      return `#${id}`
    }

    const updateActive = () => {
      const threshold = window.innerHeight * 0.4
      let current = ''

      for (const id of ALL_SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= threshold) {
          current = id
        }
      }

      setActiveSection(current ? mapToNav(current) : '')
    }

    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()

    return () => window.removeEventListener('scroll', updateActive)
  }, [])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleNavClick = useCallback((href: string) => {
    setIsOpen(false)
    const tryScroll = () => {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return true
      }
      return false
    }

    if (!tryScroll()) {
      // Section may not have rendered yet, poll briefly
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (tryScroll() || attempts >= 5) clearInterval(interval)
      }, 300)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ${
        scrolled
          ? 'border-white/5 bg-bg/80 backdrop-blur-2xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6 transition-all duration-500"
        style={{ paddingTop: scrolled ? '16px' : '28px', paddingBottom: scrolled ? '16px' : '28px' }}
      >
        <a href="/" aria-label="Home" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm h-7 flex items-center">
          {!showSplash && <AnimatedLogo layoutId="main-logo" animatePaths={false} className="h-7" />}
        </a>

        {/* The rest of the navbar contents fade in after the splash screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showSplash ? 0 : 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-10"
        >
          {/* Desktop nav links */}
          <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className={`relative cursor-pointer font-body text-[0.8125rem] tracking-[0.02em] transition-colors duration-300 ${
                activeSection === link.href
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {link.label}
              {activeSection === link.href && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Desktop resume button */}
        <a
          href="/resume"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-sm border border-border px-4 py-2 font-body text-[0.8125rem] tracking-[0.02em] text-text-muted transition-colors duration-300 hover:border-accent hover:text-accent md:inline-flex"
        >
          Résumé
          <span className="text-accent" aria-hidden="true">↗</span>
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="relative z-50 cursor-pointer text-text-primary md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="flex h-5 w-5 flex-col items-end justify-center gap-[5px]">
            <motion.span
              animate={isOpen ? { rotate: 45, y: 3.5, width: 20 } : { rotate: 0, y: 0, width: 20 }}
              className="block h-px bg-current"
              style={{ width: 20 }}
              transition={{ duration: motionDuration }}
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -3.5, width: 20 } : { rotate: 0, y: 0, width: 14 }}
              className="block h-px bg-current"
              style={{ width: 14 }}
              transition={{ duration: motionDuration }}
            />
          </div>
        </button>
        </motion.div>
      </nav>

      {/* Progressive blur trail below the navbar */}
      <div 
        className={`absolute left-0 top-full h-12 w-full pointer-events-none backdrop-blur-xl transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-2xl md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: motionDuration, delay: prefersReducedMotion ? 0 : i * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                  className="cursor-pointer font-display text-3xl tracking-tight text-text-primary transition-colors hover:text-accent"
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Mobile resume link */}
              <motion.a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: motionDuration, delay: prefersReducedMotion ? 0 : navLinks.length * 0.05 }}
                onClick={() => setIsOpen(false)}
                className="font-body text-lg uppercase tracking-[0.08em] text-text-muted transition-colors hover:text-accent"
              >
                Résumé ↗
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
