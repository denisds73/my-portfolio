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
import { createContext } from 'react'

export const SplashContext = createContext(true)

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // 2.2 seconds allows the drawing animation (1.55s) to finish with a short pause
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

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

      {/* Splash Logo - not in AnimatePresence so it unmounts instantly for clean layoutId handoff */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
          <AnimatedLogo layoutId="main-logo" className="h-28 md:h-40 text-text-primary" />
        </div>
      )}

      <div>
      <Routes>
        <Route
          path="/"
          element={
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
                <Home />
              </motion.main>
            </>
          }
        />
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
