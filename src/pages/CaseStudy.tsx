import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getSupabase } from '@/lib/supabase'
import type { Project } from '@/types'

export default function CaseStudy() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    async function fetchProject() {
      if (!id) return
      const { data, error } = await getSupabase()
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error || !data) {
        console.error('Failed to load project:', error)
        navigate('/#work')
      } else {
        setProject(data as Project)
      }
      setLoading(false)
    }
    
    fetchProject()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!project) return null

  const coverImage = project.images?.[0] || project.thumbnail_url

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        {/* Back Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link 
            to="/#work"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Portfolio
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl lg:text-7xl mb-6">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-text-secondary max-w-2xl mb-10">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Github className="h-4 w-4" />
                <span>Source Code</span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-[#020203] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit Site</span>
              </a>
            )}
          </div>
        </motion.header>

        {/* Cover Image */}
        {coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-20 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl"
          >
            <img 
              src={coverImage} 
              alt={project.title} 
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}

        {/* Tech Stack */}
        {project.tech_stack?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map(tech => (
                <span 
                  key={tech} 
                  className="rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-text-primary backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Markdown Content */}
        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h3:text-2xl prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-white/10"
        >
          {project.case_study_content ? (
            <ReactMarkdown>{project.case_study_content}</ReactMarkdown>
          ) : (
            <p className="text-text-muted italic">Case study content is currently being written.</p>
          )}
        </motion.article>
      </div>
    </div>
  )
}
