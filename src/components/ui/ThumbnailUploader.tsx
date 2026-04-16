import { useState, useRef } from 'react'
import { Upload, X, Link, Image } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

interface ThumbnailUploaderProps {
  value: string
  onChange: (url: string) => void
}

export default function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const [mode, setMode] = useState<'url' | 'upload'>(value ? 'url' : 'upload')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { data, error } = await getSupabase().storage
      .from('thumbnails')
      .upload(fileName, file, { cacheControl: '31536000', upsert: false })

    if (error) {
      console.error('Upload failed:', error)
      setUploading(false)
      return
    }

    const { data: urlData } = getSupabase().storage
      .from('thumbnails')
      .getPublicUrl(data.path)

    onChange(urlData.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const clearImage = () => {
    onChange('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">Thumbnail</label>

      {/* Mode toggle */}
      <div className="mb-3 flex gap-1 rounded-lg bg-bg-elevated p-1">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-surface text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'url'
              ? 'bg-surface text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Link className="h-3 w-3" />
          URL
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative mb-3 overflow-hidden rounded-lg border border-border">
          <img
            src={value}
            alt="Thumbnail preview"
            className="h-40 w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute right-2 top-2 cursor-pointer rounded-full bg-bg/80 p-1 text-text-muted backdrop-blur-sm transition-colors hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            dragOver
              ? 'border-accent bg-accent-glow'
              : 'border-border hover:border-border-hover'
          }`}
        >
          {uploading ? (
            <>
              <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-text-muted">Uploading...</p>
            </>
          ) : (
            <>
              <Image className="mb-2 h-6 w-6 text-text-muted" />
              <p className="text-sm text-text-secondary">
                Drop an image here or <span className="text-accent">browse</span>
              </p>
              <p className="mt-1 text-xs text-text-muted">PNG, JPG, WebP up to 5MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
        />
      )}
    </div>
  )
}
