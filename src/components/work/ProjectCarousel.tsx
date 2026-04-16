import { useState, useEffect, useCallback, useRef } from 'react'

interface ProjectCarouselProps {
  images: string[]
  title: string
}

export default function ProjectCarousel({ images, title }: ProjectCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const touchStart = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const total = images.length

  const goTo = useCallback((index: number) => {
    setCurrent((index + total) % total)
  }, [total])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(current - 1)
      if (e.key === 'ArrowRight') goTo(current + 1)
    }
    el.addEventListener('keydown', handleKey)
    return () => el.removeEventListener('keydown', handleKey)
  }, [current, goTo])

  if (total === 0) return null

  const renderImage = (src: string, i: number, style?: React.CSSProperties) => (
    <img
      key={src}
      src={src}
      alt={`${title} — ${i + 1}${total > 1 ? ` of ${total}` : ''}`}
      loading={i === 0 ? 'eager' : 'lazy'}
      className="h-full w-full object-contain transition-opacity duration-700 ease-in-out"
      style={style}
    />
  )

  if (total === 1) {
    return (
      <div className="relative bg-bg-card">
        {renderImage(images[0], 0)}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-bg-card"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return
        const diff = touchStart.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1)
        touchStart.current = null
      }}
      tabIndex={0}
      role="region"
      aria-label={`${title} images, ${current + 1} of ${total}`}
      aria-roledescription="carousel"
    >
      {/* Stacked images — crossfade, natural height from first image */}
      <div className="relative">
        {/* First image sets the height */}
        <div className="invisible">{renderImage(images[0], 0)}</div>

        {/* All images layered absolutely */}
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {renderImage(src, i)}
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goTo(current - 1) }}
        className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-bg/60 px-2.5 py-2 text-text-primary backdrop-blur-sm transition-all hover:bg-bg/80 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Previous image"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 9L4.5 6L7.5 3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goTo(current + 1) }}
        className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-bg/60 px-2.5 py-2 text-text-primary backdrop-blur-sm transition-all hover:bg-bg/80 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Next image"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3L7.5 6L4.5 9" />
        </svg>
      </button>

      {/* Progress segments */}
      <div className={`absolute bottom-0 left-0 right-0 flex h-[2px] transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-50'}`}>
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(i) }}
            className="relative h-full flex-1 cursor-pointer"
            aria-label={`Go to image ${i + 1}`}
          >
            <span
              className="absolute inset-0 transition-colors duration-300"
              style={{ backgroundColor: i === current ? 'var(--color-accent)' : 'rgba(240,237,230,0.15)' }}
            />
          </button>
        ))}
      </div>

      {/* Counter */}
      <span className={`absolute right-3 top-3 rounded bg-bg/60 px-2 py-0.5 font-body text-[10px] tabular-nums tracking-wider text-text-muted backdrop-blur-sm transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
        {current + 1} / {total}
      </span>
    </div>
  )
}
