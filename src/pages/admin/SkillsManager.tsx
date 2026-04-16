import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Save, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Button, Input, Card } from '@/components/ui'
import { getSupabase } from '@/lib/supabase'
import type { Skill } from '@/types'

type SkillForm = Omit<Skill, 'id' | 'created_at' | 'sort_order'>

const CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Tools']

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
      // Auto-assign sort_order: put at end of the category
      const categorySkills = skills.filter((s) => s.category === data.category)
      const maxOrder = categorySkills.length > 0
        ? Math.max(...categorySkills.map((s) => s.sort_order))
        : 0
      await getSupabase().from('skills').insert({ ...data, sort_order: maxOrder + 1 })
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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCategory = source.droppableId
    const destCategory = destination.droppableId
    const draggedSkill = skills.find((s) => s.id === draggableId)
    if (!draggedSkill) return

    // Build new skills array with the change applied
    const newSkills = [...skills]

    // Remove from source
    const sourceItems = newSkills
      .filter((s) => s.category === sourceCategory)
      .sort((a, b) => a.sort_order - b.sort_order)
    sourceItems.splice(source.index, 1)

    // Update the dragged skill's category
    const updatedSkill = { ...draggedSkill, category: destCategory }

    // Insert into destination
    const destItems = sourceCategory === destCategory
      ? sourceItems
      : newSkills
          .filter((s) => s.category === destCategory)
          .sort((a, b) => a.sort_order - b.sort_order)
    destItems.splice(destination.index, 0, updatedSkill)

    // Collect all updates to batch
    const updates: { id: string; category: string; sort_order: number }[] = []

    // Re-index source category
    if (sourceCategory !== destCategory) {
      sourceItems.forEach((s, i) => {
        updates.push({ id: s.id, category: sourceCategory, sort_order: i })
      })
    }

    // Re-index destination category
    destItems.forEach((s, i) => {
      updates.push({ id: s.id, category: destCategory, sort_order: i })
    })

    // Optimistic update
    const updatedSkills = skills.map((s) => {
      const update = updates.find((u) => u.id === s.id)
      if (update) return { ...s, category: update.category, sort_order: update.sort_order }
      return s
    })
    setSkills(updatedSkills)

    // Persist to Supabase
    const sb = getSupabase()
    await Promise.all(
      updates.map((u) =>
        sb.from('skills').update({ category: u.category, sort_order: u.sort_order }).eq('id', u.id)
      )
    )
  }

  // Include any extra categories from DB not in our defined list
  const extraCategories = [...new Set(skills.map((s) => s.category))].filter(
    (c) => !CATEGORIES.includes(c)
  )

  // Always show all 4 drop zones so skills can be dragged into empty categories
  const dropCategories = [...CATEGORIES, ...extraCategories]

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
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Proficiency (1-100)" type="number" {...register('proficiency', { valueAsNumber: true, min: 1, max: 100 })} />
              <Input label="Icon (optional)" {...register('icon')} />
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

      <DragDropContext onDragEnd={handleDragEnd}>
        {dropCategories.map((category) => {
          const categorySkills = skills
            .filter((s) => s.category === category)
            .sort((a, b) => a.sort_order - b.sort_order)

          return (
            <div key={category} className="mb-8">
              <h2 className="mb-4 font-mono text-sm font-medium text-accent">{category}</h2>
              <Droppable droppableId={category}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[48px] space-y-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-accent-glow' : ''
                    }`}
                  >
                    {categorySkills.map((skill, index) => (
                      <Draggable key={skill.id} draggableId={skill.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-xl border border-border bg-surface p-4 transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg shadow-accent/5 border-accent/30' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab text-text-muted hover:text-text-secondary active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-border sm:block">
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
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {categorySkills.length === 0 && !snapshot.isDraggingOver && (
                      <p className="py-4 text-center text-sm text-text-muted">Drop skills here</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>

      {skills.length === 0 && (
        <p className="py-12 text-center text-text-muted">No skills yet. Add your first one!</p>
      )}
    </div>
  )
}
