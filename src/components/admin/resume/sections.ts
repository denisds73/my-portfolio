import type { ResumeData } from '@/types/resume'

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'certifications'

export interface SectionSpec {
  key: SectionKey
  kicker: string
  label: string
  optional?: boolean
}

export const SECTIONS: SectionSpec[] = [
  { key: 'personal', kicker: '01', label: 'Personal' },
  { key: 'summary', kicker: '02', label: 'Summary' },
  { key: 'skills', kicker: '03', label: 'Skills' },
  { key: 'experience', kicker: '04', label: 'Experience' },
  { key: 'projects', kicker: '05', label: 'Projects' },
  { key: 'education', kicker: '06', label: 'Education', optional: true },
  { key: 'certifications', kicker: '07', label: 'Certifications', optional: true },
]

export function isSectionComplete(data: ResumeData, key: SectionKey): boolean {
  switch (key) {
    case 'personal':
      return Boolean(
        data.personal.firstName.trim() ||
          data.personal.lastName.trim() ||
          data.personal.email.trim(),
      )
    case 'summary':
      return data.summary.trim().length > 0
    case 'skills':
      return data.skills.some((g) => g.skills.length > 0)
    case 'experience':
      return data.experience.length > 0
    case 'projects':
      return data.projects.length > 0
    case 'education':
      return data.education.length > 0
    case 'certifications':
      return data.certifications.length > 0
  }
}

export function getSectionIndex(key: SectionKey): number {
  return SECTIONS.findIndex((s) => s.key === key)
}

export function isValidSection(v: string | null | undefined): v is SectionKey {
  if (!v) return false
  return SECTIONS.some((s) => s.key === v)
}
