import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import ScrollProgress from '@/components/layout/ScrollProgress'
import AnimatedLogo from '@/components/ui/AnimatedLogo'
import Home from '@/pages/Home'
import Resume from '@/pages/Resume'
import AdminLogin from '@/pages/admin/Login'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import ProjectsManager from '@/pages/admin/ProjectsManager'
import SkillsManager from '@/pages/admin/SkillsManager'
import ExperienceManager from '@/pages/admin/ExperienceManager'
import ResumeManager from '@/pages/admin/ResumeManager'
import CaseStudy from '@/pages/CaseStudy'
import { createContext } from 'react'

export const SplashContext = createContext(true)

import { Outlet, useLocation } from 'react-router-dom'

function MainLayout({ showSplash }: { showSplash: boolean }) {
  const location = useLocation()

  // Handle hash scrolling when navigating back to sections (e.g. /#work)
  useEffect(() => {
    if (!showSplash && location.hash) {
      const id = location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
          
          // Clear the hash from the URL silently so a page refresh doesn't jump back down
          const url = new URL(window.location.href)
          url.hash = ''
          window.history.replaceState(null, '', url.toString())
        }, 100)
      }
    }
  }, [location, showSplash])

  return (
    <>
      <div className="gradient-mesh" aria-hidden="true" />
      <ScrollProgress />
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 30 : 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className={showSplash ? 'pointer-events-none' : ''}
      >
        <Outlet />
      </motion.main>
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => window.location.pathname === '/')

  useEffect(() => {
    if ('scrollRestoration' in history) {
      // Force manual restoration only during the splash screen to prevent jarring jumps
      history.scrollRestoration = showSplash ? 'manual' : 'auto'
    }

    if (!showSplash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const timer = setTimeout(() => {
      setShowSplash(false)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 2200)

    return () => clearTimeout(timer)
  }, [showSplash])

  return (
    <SplashContext.Provider value={showSplash}>
    <BrowserRouter>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-bg"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[90] bg-bg"
          />
        )}
      </AnimatePresence>

      {/* Splash Logo */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
          <AnimatedLogo layoutId="main-logo" className="h-28 md:h-40 text-text-primary" />
        </div>
      )}

      <div>
      <Routes>
        <Route element={<MainLayout showSplash={showSplash} />}>
          <Route path="/" element={<Home />} />
          <Route path="/case-study/:id" element={<CaseStudy />} />
        </Route>
        
        <Route path="/resume" element={<Resume />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="skills" element={<SkillsManager />} />
          <Route path="experience" element={<ExperienceManager />} />
          <Route path="resume" element={<ResumeManager />} />
        </Route>
      </Routes>
      </div>
    </BrowserRouter>
    </SplashContext.Provider>
  )
}
