import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { getSupabase } from '@/lib/supabase'
import type { Skill } from '@/types'

type SkillForm = Omit<Skill, 'id' | 'created_at'>

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, setValue } = useForm<SkillForm>()

  const fetchSkills = async () => {
    const { data } = await getSupabase().from('skills').select('*').order('sort_order')
    if (data) setSkills(data)
  }

  useEffect(() => { fetchSkills() }, [])

  const onSubmit = async (data: SkillForm) => {
    if (editing) {
      await getSupabase().from('skills').update(data).eq('id', editing)
    } else {
      await getSupabase().from('skills').insert(data)
    }
    setEditing(null)
    setShowForm(false)
    reset()
    fetchSkills()
  }

  const startEdit = (skill: Skill) => {
    setEditing(skill.id)
    setShowForm(true)
    setValue('name', skill.name)
    setValue('category', skill.category)
    setValue('proficiency', skill.proficiency)
    setValue('icon', skill.icon)
    setValue('sort_order', skill.sort_order)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    await getSupabase().from('skills').delete().eq('id', id)
    fetchSkills()
  }

  const cancelForm = () => {
    setEditing(null)
    setShowForm(false)
    reset()
  }

  const categories = Array.from(new Set(skills.map((s) => s.category)))

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Skills</h1>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditing(null); reset() }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        )}
      </div>

      {showForm && (
        <Card hover={false} className="mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" {...register('name', { required: true })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Category</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                >
                  <option value="">Select category</option>
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Proficiency (1-100)" type="number" {...register('proficiency', { valueAsNumber: true, min: 1, max: 100 })} />
              <Input label="Icon (optional)" {...register('icon')} />
              <Input label="Sort Order" type="number" {...register('sort_order', { valueAsNumber: true })} />
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

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="mb-4 font-mono text-sm font-medium text-accent">{category}</h2>
          <div className="space-y-2">
            {skills
              .filter((s) => s.category === category)
              .map((skill) => (
                <Card key={skill.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                    <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-border sm:block">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                    <span className="font-mono text-xs text-text-muted">{skill.proficiency}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(skill)} className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(skill.id)} className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <p className="py-12 text-center text-text-muted">No skills yet. Add your first one!</p>
      )}
    </div>
  )
}
