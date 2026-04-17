import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  type PublishedResumeMeta,
  unpublishResumePdf,
  uploadResumePdf,
} from '@/lib/resumePublish'

type Status = 'idle' | 'loading' | 'uploading' | 'error'

export interface UseResumePublishReturn {
  status: Status
  error: string | null
  published: PublishedResumeMeta | null
  publish: (file: File) => Promise<void>
  unpublish: () => Promise<void>
  reload: () => Promise<void>
}

export function useResumePublish(): UseResumePublishReturn {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState<PublishedResumeMeta | null>(null)
  const cancelRef = useRef(false)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('idle')
      return
    }
    try {
      const { data, error: rowError } = await getSupabase()
        .from('resume')
        .select(
          'published_pdf_path, published_file_name, published_file_size, published_at',
        )
        .eq('singleton', true)
        .maybeSingle()
      if (cancelRef.current) return
      if (rowError) throw rowError
      if (
        data?.published_pdf_path &&
        data.published_file_name &&
        data.published_file_size !== null &&
        data.published_at
      ) {
        setPublished({
          path: data.published_pdf_path,
          fileName: data.published_file_name,
          fileSize: data.published_file_size,
          publishedAt: data.published_at,
        })
      } else {
        setPublished(null)
      }
      setStatus('idle')
      setError(null)
    } catch (e) {
      if (cancelRef.current) return
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Failed to load publish state.')
    }
  }, [])

  useEffect(() => {
    cancelRef.current = false
    load()
    return () => {
      cancelRef.current = true
    }
  }, [load])

  const publish = useCallback(async (file: File) => {
    setStatus('uploading')
    setError(null)
    try {
      const meta = await uploadResumePdf(file)
      setPublished(meta)
      setStatus('idle')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Upload failed.')
      throw e
    }
  }, [])

  const unpublish = useCallback(async () => {
    setStatus('uploading')
    setError(null)
    try {
      await unpublishResumePdf()
      setPublished(null)
      setStatus('idle')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Failed to unpublish.')
      throw e
    }
  }, [])

  return { status, error, published, publish, unpublish, reload: load }
}
