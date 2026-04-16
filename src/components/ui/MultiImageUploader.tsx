import { useState, useRef, useEffect, useCallback } from 'react'
import { X, GripVertical, Image, Plus } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { getSupabase } from '@/lib/supabase'

interface MultiImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function MultiImageUploader({ images, onChange }: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) return null
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { data, error } = await getSupabase().storage
      .from('thumbnails')
      .upload(fileName, file, { cacheControl: '31536000', upsert: false })

    if (error) {
      console.error('Upload failed:', error)
      return null
    }

    const { data: urlData } = getSupabase().storage
      .from('thumbnails')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true)
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const urls: string[] = []

    for (const file of fileArray) {
      const url = await uploadFile(file)
      if (url) urls.push(url)
    }

    if (urls.length > 0) {
      onChange([...images, ...urls])
    }
    setUploading(false)
  }, [images, onChange, uploadFile])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault()
        handleFiles(imageFiles)
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handleFiles])

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const addUrl = () => {
    const url = urlInput.trim()
    if (url) {
      onChange([...images, url])
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleReorder = (result: DropResult) => {
    if (!result.destination) return
    const reordered = [...images]
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    onChange(reordered)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
        Images
        {images.length > 0 && (
          <span className="ml-2 text-xs text-text-muted">
            {images.length} image{images.length !== 1 ? 's' : ''} — first is the cover
          </span>
        )}
      </label>

      {/* Sortable image previews */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="mb-3 flex gap-2 overflow-x-auto pb-2"
              >
                {images.map((url, i) => (
                  <Draggable key={`${url}-${i}`} draggableId={`img-${i}`} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border transition-shadow ${
                          i === 0 ? 'border-accent/40' : 'border-border'
                        } ${snapshot.isDragging ? 'shadow-lg shadow-accent/10' : ''}`}
                      >
                        <img
                          src={url}
                          alt={`Image ${i + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                        />

                        {/* Cover badge */}
                        {i === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-bg">
                            Cover
                          </span>
                        )}

                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute bottom-1 left-1 cursor-grab rounded bg-bg/70 p-0.5 text-text-muted opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                        >
                          <GripVertical className="h-3 w-3" />
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 cursor-pointer rounded-full bg-bg/70 p-0.5 text-text-muted opacity-0 backdrop-blur-sm transition-all hover:text-red-400 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
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
            <Image className="mb-2 h-5 w-5 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drop images, <span className="text-accent">browse</span>, or Ctrl+V to paste
            </p>
            <p className="mt-1 text-xs text-text-muted">Multiple files supported</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Add URL option */}
      <div className="mt-2">
        {showUrlInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
              autoFocus
            />
            <button
              type="button"
              onClick={addUrl}
              className="cursor-pointer rounded-lg bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-80"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlInput('') }}
              className="cursor-pointer rounded-lg px-2 py-2 text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex cursor-pointer items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-accent"
          >
            <Plus className="h-3 w-3" />
            Add from URL
          </button>
        )}
      </div>
    </div>
  )
}
