import { useState } from 'react'
import { exercises } from '../data/exercises'
import { gifUrl } from '../data/media'
import { categoryInfo, type Exercise } from '../data/types'
import { StillFrame } from '../components/StillFrame'
import { TopBar } from '../components/TopBar'

function categoryLabel(exercise: Exercise): string {
  return exercise.categories.map((category) => categoryInfo[category].title).join(' · ')
}

function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  const src = gifUrl(exercise.id)
  if (!src) return <span className="catalog-thumb catalog-thumb-empty" aria-hidden="true" />
  return <StillFrame className="catalog-thumb" src={src} alt="" />
}

export function BuilderScreen({
  onBack,
  onSave,
}: {
  onBack: () => void
  onSave: (name: string, exerciseIds: string[]) => void
}) {
  const [name, setName] = useState('')
  const [order, setOrder] = useState<Exercise[]>([])
  const canSave = name.trim().length > 0 && order.length > 0

  function add(exercise: Exercise) {
    setOrder((current) => [...current, exercise])
  }

  function move(index: number, direction: -1 | 1) {
    setOrder((current) => {
      const next = index + direction
      if (next < 0 || next >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  function remove(index: number) {
    setOrder((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="screen screen-scroll">
      <TopBar
        title="Build"
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            Back
          </button>
        }
        right={
          <button
            type="button"
            className="text-btn"
            disabled={!canSave}
            onClick={() => onSave(name.trim(), order.map((exercise) => exercise.id))}
          >
            Save
          </button>
        }
      />
      <label className="field">
        <span>Workout name</span>
        <input
          value={name}
          maxLength={40}
          placeholder="Morning core"
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <p className="builder-note">
        Uses your Settings timing and a 3 second rest. A short list repeats until the session is full. A longer list plays all the way through.
      </p>
      <div className="settings-block">
        <h2>Order</h2>
        {order.length === 0 ? (
          <p>Add moves from the list below.</p>
        ) : (
          <ol className="catalog">
            {order.map((exercise, index) => (
              <li key={`${exercise.id}-${index}`} className="catalog-row">
                <ExerciseThumb exercise={exercise} />
                <div>
                  <p className="favorite-name">
                    {index + 1}. {exercise.name}
                  </p>
                  <p className="favorite-meta">{categoryLabel(exercise)}</p>
                  <div className="row-actions">
                    <button type="button" className="text-btn" disabled={index === 0} onClick={() => move(index, -1)}>
                      Up
                    </button>
                    <button
                      type="button"
                      className="text-btn"
                      disabled={index === order.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      Down
                    </button>
                    <button type="button" className="text-btn text-btn-muted" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="settings-block">
        <h2>Exercises</h2>
        <ul className="catalog">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="catalog-row">
              <ExerciseThumb exercise={exercise} />
              <div>
                <p className="favorite-name">{exercise.name}</p>
                <p className="favorite-meta">{categoryLabel(exercise)}</p>
              </div>
              <button type="button" className="text-btn" onClick={() => add(exercise)}>
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
