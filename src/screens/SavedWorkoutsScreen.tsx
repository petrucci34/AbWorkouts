import { exerciseById } from '../data/exercises'
import type { SavedWorkout, WorkoutSettings } from '../data/types'
import { REST_SECONDS } from '../lib/engine'
import { TopBar } from '../components/TopBar'

export function SavedWorkoutsScreen({
  workouts,
  settings,
  onStart,
  onDelete,
  onBuild,
  onBack,
}: {
  workouts: SavedWorkout[]
  settings: WorkoutSettings
  onStart: (id: string) => void
  onDelete: (id: string) => void
  onBuild: () => void
  onBack: () => void
}) {
  return (
    <section className="screen screen-scroll">
      <TopBar
        title="Saved workouts"
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            Back
          </button>
        }
        right={
          <button type="button" className="text-btn" onClick={onBuild}>
            New
          </button>
        }
      />
      <p className="chip">
        {settings.durationMinutes} min · {settings.exerciseSeconds}s each · {REST_SECONDS}s rest
      </p>
      {workouts.length === 0 ? (
        <div className="empty">
          <h2>No saved workouts</h2>
          <p>Pick exercises, put them in order, and they stay on this device.</p>
        </div>
      ) : (
        <ul className="saved-list">
          {workouts.map((workout) => {
            const names = workout.exerciseIds
              .map((id) => exerciseById(id)?.name)
              .filter((name): name is string => Boolean(name))
            return (
              <li key={workout.id} className="saved-card">
                <p className="favorite-name">{workout.name}</p>
                <p className="favorite-meta">
                  {names.length} {names.length === 1 ? 'exercise' : 'exercises'} · {names.join(', ')}
                </p>
                <div className="saved-actions">
                  <button type="button" className="control control-accent" onClick={() => onStart(workout.id)}>
                    Start
                  </button>
                  <button type="button" className="control" onClick={() => onDelete(workout.id)}>
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {workouts.length === 0 && (
        <button type="button" className="primary" onClick={onBuild}>
          Build a workout
        </button>
      )}
    </section>
  )
}
