import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { Button, Input, Textarea, Card } from '@/components/ui'
import MonthPicker from '@/components/ui/MonthPicker'
import { getSupabase } from '@/lib/supabase'
import type { Experience } from '@/types'

type ExperienceForm = Omit<Experience, 'id' | 'created_at'>

export default function ExperienceManager() {
  const [items, setItems] = useState<Experience[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isPresent, setIsPresent] = useState(false)
  const { register, handleSubmit, reset, setValue } = useForm<ExperienceForm>()

  const fetchItems = async () => {
    const { data } = await getSupabase().from('experience').select('*').order('sort_order')
    if (data) setItems(data)
  }

  useEffect(() => { fetchItems() }, [])

  const onSubmit = async (data: ExperienceForm) => {
    // Auto-assign sort_order for new entries
    const sortOrder = editing
      ? data.sort_order
      : items.length > 0
        ? Math.max(...items.map((i) => i.sort_order)) + 1
        : 1

    const payload = {
      company: data.company,
      role: data.role,
      description: data.description,
      start_date: startDate,
      end_date: isPresent ? null : endDate,
      sort_order: sortOrder,
    }

    if (editing) {
      await getSupabase().from('experience').update(payload).eq('id', editing)
    } else {
      await getSupabase().from('experience').insert(payload)
    }
    setEditing(null)
    setShowForm(false)
    resetForm()
    fetchItems()
  }

  const resetForm = () => {
    reset()
    setStartDate(null)
    setEndDate(null)
    setIsPresent(false)
  }

  const startEdit = (item: Experience) => {
    setEditing(item.id)
    setShowForm(true)
    setValue('company', item.company)
    setValue('role', item.role)
    setValue('description', item.description)
    setValue('sort_order', item.sort_order)
    setStartDate(item.start_date)
    if (item.end_date) {
      setEndDate(item.end_date)
      setIsPresent(false)
    } else {
      setEndDate(null)
      setIsPresent(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await getSupabase().from('experience').delete().eq('id', id)
    fetchItems()
  }

  const cancelForm = () => {
    setEditing(null)
    setShowForm(false)
    resetForm()
  }

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Experience</h1>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditing(null); resetForm() }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        )}
      </div>

      {showForm && (
        <Card hover={false} className="mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company" {...register('company', { required: true })} />
              <Input label="Role" {...register('role', { required: true })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MonthPicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <MonthPicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                allowPresent
                isPresent={isPresent}
                onPresentChange={setIsPresent}
              />
            </div>
            <Textarea label="Description" rows={3} {...register('description', { required: true })} />
            <div className="flex gap-3">
              <Button type="submit" disabled={!startDate}>
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
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">{item.role}</h3>
              <p className="mt-0.5 text-sm text-accent">{item.company}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatDate(item.start_date)} — {item.end_date ? formatDate(item.end_date) : (
                  <span className="text-accent">Present</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(item)} className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-text-muted">No experience entries yet. Add your first one!</p>
        )}
      </div>
    </div>
  )
}
