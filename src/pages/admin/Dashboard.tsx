import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Wrench, Briefcase, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui'
import { getSupabase } from '@/lib/supabase'

interface Stats {
  projects: number
  skills: number
  experience: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ projects: 0, skills: 0, experience: 0 })

  useEffect(() => {
    async function fetchStats() {
      const sb = getSupabase()
      const [projects, skills, experience] = await Promise.all([
        sb.from('projects').select('id', { count: 'exact', head: true }),
        sb.from('skills').select('id', { count: 'exact', head: true }),
        sb.from('experience').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        projects: projects.count ?? 0,
        skills: skills.count ?? 0,
        experience: experience.count ?? 0,
      })
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Projects', count: stats.projects, icon: FolderKanban, href: '/admin/projects', color: 'text-cyan-400' },
    { label: 'Skills', count: stats.skills, icon: Wrench, href: '/admin/skills', color: 'text-emerald-400' },
    { label: 'Experience', count: stats.experience, icon: Briefcase, href: '/admin/experience', color: 'text-amber-400' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.href}>
            <Card className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-text-primary">{card.count}</p>
                </div>
                <div className={`rounded-lg bg-surface-hover p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-text-muted group-hover:text-accent transition-colors">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
