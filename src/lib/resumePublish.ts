import { getSupabase } from '@/lib/supabase'

export const RESUME_BUCKET = 'resumes'
export const RESUME_OBJECT_PATH = 'published/resume-latest.pdf'
export const MAX_RESUME_PDF_BYTES = 10 * 1024 * 1024 // 10 MB guardrail

export interface PublishedResumeMeta {
  path: string
  fileName: string
  fileSize: number
  publishedAt: string
}

function publicUrlFor(path: string, downloadFileName?: string): string {
  const { data } = getSupabase()
    .storage.from(RESUME_BUCKET)
    .getPublicUrl(path, downloadFileName ? { download: downloadFileName } : undefined)
  return data.publicUrl
}

export function viewUrl(path: string): string {
  return publicUrlFor(path)
}

export function downloadUrl(path: string, fileName: string): string {
  return publicUrlFor(path, fileName)
}

export async function uploadResumePdf(file: File): Promise<PublishedResumeMeta> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files can be uploaded.')
  }
  if (file.size > MAX_RESUME_PDF_BYTES) {
    throw new Error(
      `File is too large (${formatBytes(file.size)}). Maximum is ${formatBytes(MAX_RESUME_PDF_BYTES)}.`,
    )
  }

  const supabase = getSupabase()

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(RESUME_OBJECT_PATH, file, {
      cacheControl: '60',
      contentType: 'application/pdf',
      upsert: true,
    })
  if (uploadError) throw uploadError

  const publishedAt = new Date().toISOString()
  const { data: updated, error: rowError } = await supabase
    .from('resume')
    .update({
      published_pdf_path: RESUME_OBJECT_PATH,
      published_file_name: file.name,
      published_file_size: file.size,
      published_at: publishedAt,
    })
    .eq('singleton', true)
    .select('id')
  if (rowError) throw rowError
  if (!updated || updated.length === 0) {
    throw new Error(
      'Resume row not found. Save any field in the resume builder at least once, then re-upload.',
    )
  }

  return {
    path: RESUME_OBJECT_PATH,
    fileName: file.name,
    fileSize: file.size,
    publishedAt,
  }
}

export async function unpublishResumePdf(): Promise<void> {
  const supabase = getSupabase()

  const { error: removeError } = await supabase.storage
    .from(RESUME_BUCKET)
    .remove([RESUME_OBJECT_PATH])
  if (removeError && removeError.message && !/not\s*found/i.test(removeError.message)) {
    throw removeError
  }

  const { error: rowError } = await supabase
    .from('resume')
    .update({
      published_pdf_path: null,
      published_file_name: null,
      published_file_size: null,
      published_at: null,
    })
    .eq('singleton', true)
  if (rowError) throw rowError
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
