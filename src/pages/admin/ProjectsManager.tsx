import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { Button, Input, Textarea, Card } from '@/components/ui'
import ThumbnailUploader from '@/components/ui/ThumbnailUploader'
import { getSupabase } from '@/lib/supabase'
import type { Project } from '@/types'

type ProjectForm = Omit<Project, 'id' | 'created_at' | 'updated_at'>

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const { register, handleSubmit, reset, setValue } = useForm<ProjectForm>()

  const fetchProjects = async () => {
    const { data } = await getSupabase().from('projects').select('*').order('sort_order')
    if (data) setProjects(data)
  }

  useEffect(() => { fetchProjects() }, [])

  const onSubmit = async (data: ProjectForm) => {
    const techStack = typeof data.tech_stack === 'string'
      ? (data.tech_stack as unknown as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      : data.tech_stack

    const sortOrder = editing
      ? data.sort_order
      : projects.length > 0
        ? Math.max(...projects.map((p) => p.sort_order)) + 1
        : 1

    const payload = { ...data, tech_stack: techStack, thumbnail_url: thumbnailUrl, sort_order: sortOrder }

    if (editing) {
      await getSupabase().from('projects').update(payload).eq('id', editing)
    } else {
      await getSupabase().from('projects').insert(payload)
    }
    setEditing(null)
    setShowForm(false)
    resetForm()
    fetchProjects()
  }

  const resetForm = () => {
    reset()
    setThumbnailUrl('')
  }

  const startEdit = (project: Project) => {
    setEditing(project.id)
    setShowForm(true)
    setValue('title', project.title)
    setValue('description', project.description)
    setValue('long_description', project.long_description)
    setValue('live_url', project.live_url)
    setValue('github_url', project.github_url)
    setValue('tech_stack', project.tech_stack as unknown as string[])
    setValue('featured', project.featured)
    setValue('sort_order', project.sort_order)
    setThumbnailUrl(project.thumbnail_url)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await getSupabase().from('projects').delete().eq('id', id)
    fetchProjects()
  }

  const cancelForm = () => {
    setEditing(null)
    setShowForm(false)
    resetForm()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditing(null); resetForm() }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {showForm && (
        <Card hover={false} className="mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" {...register('title', { required: true })} />
            <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
            <Textarea label="Description" rows={2} {...register('description', { required: true })} />
            <Textarea label="Long Description" rows={3} {...register('long_description')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Live URL" {...register('live_url')} />
              <Input label="GitHub URL" {...register('github_url')} />
            </div>
            <Input label="Tech Stack (comma-separated)" {...register('tech_stack')} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" {...register('featured')} className="accent-accent" />
              <label htmlFor="featured" className="text-sm text-text-secondary">Featured project</label>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editing ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelForm}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {project.thumbnail_url && (
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="h-12 w-20 rounded object-cover"
                />
              )}
              <div>
                <h3 className="font-medium text-text-primary">{project.title}</h3>
                <p className="mt-0.5 text-sm text-text-muted">{project.tech_stack.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {project.featured && (
                <span className="rounded bg-accent-glow px-2 py-0.5 font-mono text-xs text-accent">
                  Featured
                </span>
              )}
              <button onClick={() => startEdit(project)} className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(project.id)} className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="py-12 text-center text-text-muted">No projects yet. Add your first one!</p>
        )}
      </div>
    </div>
  )
}
