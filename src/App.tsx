import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import ScrollProgress from '@/components/layout/ScrollProgress'
import CustomCursor from '@/components/layout/CustomCursor'
import Home from '@/pages/Home'
import Resume from '@/pages/Resume'
import AdminLogin from '@/pages/admin/Login'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import ProjectsManager from '@/pages/admin/ProjectsManager'
import SkillsManager from '@/pages/admin/SkillsManager'
import ExperienceManager from '@/pages/admin/ExperienceManager'
import ResumeManager from '@/pages/admin/ResumeManager'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ScrollProgress />
              <CustomCursor />
              <Navbar />
              <main>
                <Home />
              </main>
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
    </BrowserRouter>
  )
}
