import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sectionIds = ['#about', '#work', '#skills', '#experience', '#contact']
    const sections = sectionIds.map((id) => document.querySelector(id))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = `#${entry.target.id}`
            // Map skills/experience to nearest nav link
            if (id === '#skills' || id === '#experience') {
              setActiveSection('#work')
            } else {
              setActiveSection(id)
            }
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((s) => s && observer.observe(s))
    return () => observer.disconnect()
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
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-border bg-bg/80 backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6 transition-all duration-500"
        style={{ paddingTop: scrolled ? '12px' : '24px', paddingBottom: scrolled ? '12px' : '24px' }}
      >
        <a
          href="/"
          className="font-display text-lg tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          denis<span className="text-accent">.</span>
        </a>

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
          href="/resume.pdf"
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
              transition={{ duration: 0.3 }}
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -3.5, width: 20 } : { rotate: 0, y: 0, width: 14 }}
              className="block h-px bg-current"
              style={{ width: 14 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </button>
      </nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                  className="cursor-pointer font-display text-3xl tracking-tight text-text-primary transition-colors hover:text-accent"
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Mobile resume link */}
              <motion.a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, delay: navLinks.length * 0.05 }}
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
