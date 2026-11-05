import { useEffect, useState } from 'react'

function firstFrame(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth || 1
      canvas.height = image.naturalHeight || 1
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Could not draw the still frame'))
        return
      }
      context.drawImage(image, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error('Could not load the image'))
    image.src = src
  })
}

export function StillFrame({
  src,
  className,
  alt,
}: {
  src: string
  className?: string
  alt: string
}) {
  const [frame, setFrame] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setFrame(null)
    firstFrame(src).then(
      (url) => {
        if (!cancelled) setFrame(url)
      },
      () => {
        if (!cancelled) setFrame(null)
      },
    )
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <img
      className={className}
      src={frame ?? undefined}
      alt={alt}
      data-source={src}
      draggable={false}
    />
  )
}
