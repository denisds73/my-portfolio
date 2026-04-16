import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui'
import MonthPicker from '@/components/ui/MonthPicker'
import type { ResumeExperienceEntry } from '@/types/resume'
import RepeatableSection from './RepeatableSection'

interface Props {
  value: ResumeExperienceEntry[]
  onChange: (next: ResumeExperienceEntry[]) => void
}

const makeEmpty = (): ResumeExperienceEntry => ({
  id: crypto.randomUUID(),
  company: '',
  role: '',
  location: '',
  startDate: null,
  endDate: null,
  bullets: [''],
})

export default function ExperienceEditor({ value, onChange }: Props) {
  return (
    <RepeatableSection
      kicker="04"
      title="Experience"
      items={value}
      onChange={onChange}
      makeEmpty={makeEmpty}
      addLabel="Add role"
      emptyLabel="No work experience yet. Add your first role."
      renderItem={(item, update) => {
        const setField = <K extends keyof ResumeExperienceEntry>(
          k: K,
          v: ResumeExperienceEntry[K],
        ) => update({ ...item, [k]: v })

        const setBullet = (i: number, text: string) => {
          const next = [...item.bullets]
          next[i] = text
          update({ ...item, bullets: next })
        }
        const addBullet = () =>
          update({ ...item, bullets: [...item.bullets, ''] })
        const removeBullet = (i: number) =>
          update({ ...item, bullets: item.bullets.filter((_, n) => n !== i) })

        const isPresent = item.endDate === null && Boolean(item.startDate)

        return (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Role"
                value={item.role}
                onChange={(e) => setField('role', e.target.value)}
              />
              <Input
                label="Company"
                value={item.company}
                onChange={(e) => setField('company', e.target.value)}
              />
            </div>
            <Input
              label="Location (optional)"
              value={item.location ?? ''}
              onChange={(e) => setField('location', e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <MonthPicker
                label="Start Date"
                value={item.startDate}
                onChange={(v) => setField('startDate', v)}
              />
              <MonthPicker
                label="End Date"
                value={item.endDate}
                onChange={(v) => setField('endDate', v)}
                allowPresent
                isPresent={isPresent}
                onPresentChange={(present) =>
                  setField('endDate', present ? null : (item.endDate ?? ''))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Bullet points
              </label>
              <div className="space-y-2">
                {item.bullets.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-2.5 text-text-muted" aria-hidden="true">•</span>
                    <input
                      value={b}
                      onChange={(e) => setBullet(i, e.target.value)}
                      placeholder="Shipped feature X that achieved Y…"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(i)}
                      className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                      aria-label="Remove bullet"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBullet}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  <Plus className="h-3 w-3" />
                  Add bullet
                </button>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
