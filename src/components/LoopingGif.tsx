import { useState } from 'react'
import type { Exercise } from '../data/types'
import { gifUrl } from '../data/media'
import { StillFrame } from './StillFrame'

export function ExerciseDemo({ exercise, playing }: { exercise: Exercise; playing: boolean }) {
  const src = gifUrl(exercise.id)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="gif-frame gif-fallback" role="img" aria-label={`${exercise.name}. No demo clip.`}>
        <p>{exercise.name}</p>
        <p>No demo clip</p>
      </div>
    )
  }

  return (
    <div className="gif-frame" data-exercise={exercise.id}>
      {playing ? (
        <img
          key={src}
          className="demo-image"
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <StillFrame className="demo-image" src={src} alt="" />
      )}
    </div>
  )
}
