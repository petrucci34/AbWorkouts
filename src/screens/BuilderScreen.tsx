import { useState } from 'react'
import { StillFrame } from '../components/StillFrame'
import { TopBar } from '../components/TopBar'
import { exercises } from '../data/exercises'
import { gifUrl } from '../data/media'
import { categoryInfo, type Exercise, type SavedWorkout } from '../data/types'

const maxNameLength = 40

export function BuilderScreen({
  onSave,
  onBack,
}: {
  onSave: (workout: SavedWorkout) => void
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [exerciseIds, setExerciseIds] = useState<string[]>([])
  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && exerciseIds.length > 0
  const picked = exercises.filter((exercise) => exerciseIds.includes(exercise.id))
  const ordered = exerciseIds
    .map((id) => picked.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))

  function toggle(id: string) {
    setExerciseIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function move(index: number, direction: -1 | 1) {
    setExerciseIds((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = current.slice()
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  function save() {
    if (!canSave) return
    onSave({
      id: crypto.randomUUID(),
      name: trimmed.slice(0, maxNameLength),
      exerciseIds,
    })
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
      />
      <label className="name-field">
        Workout name
        <input
          value={name}
          maxLength={maxNameLength}
          placeholder="Morning core"
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <p className="builder-note">
        A short list repeats until your session time is filled. A longer list plays straight through.
      </p>
      {ordered.length > 0 && (
        <>
          <p className="section-label">Order</p>
          <ol className="order-list">
            {ordered.map((exercise, index) => (
              <li key={exercise.id} className="order-row">
                <div className="order-main">
                  <span className="order-index">{index + 1}</span>
                  <span className="catalog-copy">
                    <span className="favorite-name">{exercise.name}</span>
                    <span className="favorite-meta">{categoryLabel(exercise)}</span>
                  </span>
                </div>
                <div className="order-actions">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${exercise.name} up`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => move(index, 1)}
                    disabled={index === ordered.length - 1}
                    aria-label={`Move ${exercise.name} down`}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => toggle(exercise.id)}
                    aria-label={`Remove ${exercise.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="section-label">Exercises</p>
      <ul className="catalog">
        {exercises.map((exercise) => {
          const selected = exerciseIds.includes(exercise.id)
          const src = gifUrl(exercise.id)
          return (
            <li key={exercise.id}>
              <button
                type="button"
                className="catalog-row"
                data-exercise={exercise.id}
                aria-pressed={selected}
                onClick={() => toggle(exercise.id)}
              >
                {src ? (
                  <StillFrame className="exercise-thumb" src={src} alt="" />
                ) : (
                  <span className="exercise-thumb exercise-thumb-empty" aria-hidden="true">
                    {exercise.name.slice(0, 1)}
                  </span>
                )}
                <span className="catalog-copy">
                  <span className="favorite-name">{exercise.name}</span>
                  <span className="favorite-meta">{categoryLabel(exercise)}</span>
                </span>
                <span className="catalog-state">{selected ? 'Added' : 'Add'}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <button type="button" className="primary builder-save" onClick={save} disabled={!canSave}>
        Save workout
      </button>
    </section>
  )
}

function categoryLabel(exercise: Exercise): string {
  return exercise.categories.map((category) => categoryInfo[category].title).join(' · ')
}
