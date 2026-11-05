import { useEffect, useRef, useState } from 'react'
import type { Exercise } from '../data/types'
import { gifUrl } from '../data/media'

function snapshot(img: HTMLImageElement): string | null {
  if (img.naturalWidth === 0) return null
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}

function LoopingGif({
  src,
  alt,
  playing,
  onError,
}: {
  src: string
  alt: string
  playing: boolean
  onError: () => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [frozen, setFrozen] = useState<string | null>(null)

  useEffect(() => {
    setFrozen(null)
  }, [src, playing])

  function capture(img: HTMLImageElement | null) {
    if (playing || !img || img.naturalWidth === 0) return
    if (img.currentSrc.startsWith('data:')) return
    const shot = snapshot(img)
    if (shot) setFrozen(shot)
  }

  useEffect(() => {
    if (playing) return
    capture(imgRef.current)
  }, [playing, src])

  const shown = !playing && frozen ? frozen : src

  return (
    <img
      ref={imgRef}
      className="demo-image"
      src={shown}
      alt={alt}
      draggable={false}
      onError={onError}
      onLoad={(event) => capture(event.currentTarget)}
    />
  )
}

export function ExerciseDemo({ exercise, playing }: { exercise: Exercise; playing: boolean }) {
  const src = gifUrl(exercise.id)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [exercise.id])

  if (!src || failed) {
    return (
      <div className="gif-frame gif-fallback" role="img" aria-label={`${exercise.name}. No demo clip.`}>
        <p>{exercise.name}</p>
        <p>No demo clip</p>
      </div>
    )
  }

  return (
    <div className="gif-frame">
      <LoopingGif key={exercise.id} src={src} alt="" playing={playing} onError={() => setFailed(true)} />
    </div>
  )
}
