import { categoryCovers } from '../data/catalog'
import { gifUrl } from '../data/media'
import { categories, categoryInfo, type Category, type WorkoutSettings } from '../data/types'
import { MinutesChart } from '../components/MinutesChart'
import { REST_SECONDS } from '../lib/engine'
import { dailyTotals, rangeHeadline, type WorkoutLog } from '../lib/history'
import type { SavedWorkout } from '../lib/storage'
import { SlidersIcon, StarIcon } from '../components/Icons'
import { StillFrame } from '../components/StillFrame'
import { TopBar } from '../components/TopBar'

function savedCover(workout: SavedWorkout): string {
  for (const id of workout.exerciseIds) {
    const src = gifUrl(id)
    if (src) return src
  }
  return ''
}

function moveCount(count: number): string {
  return count === 1 ? '1 move' : `${count} moves`
}

export function HomeScreen({
  settings,
  favoriteCount,
  savedWorkouts,
  logs,
  onStart,
  onSettings,
  onFavorites,
  onHistory,
  onBuild,
  onStartSaved,
  onDeleteSaved,
}: {
  settings: WorkoutSettings
  favoriteCount: number
  savedWorkouts: SavedWorkout[]
  logs: WorkoutLog[]
  onStart: (category: Category) => void
  onSettings: () => void
  onFavorites: () => void
  onHistory: () => void
  onBuild: () => void
  onStartSaved: (id: string) => void
  onDeleteSaved: (id: string) => void
}) {
  const today = new Date()
  const week = dailyTotals(logs, 7, today)
  const weekLabel = rangeHeadline(logs, 7, today)
  return (
    <section className="screen screen-scroll">
      <TopBar
        right={
          <>
            <button type="button" className="icon-btn" onClick={onFavorites} aria-label="Favorites">
              <StarIcon filled={favoriteCount > 0} />
            </button>
            <button type="button" className="icon-btn" onClick={onSettings} aria-label="Settings">
              <SlidersIcon />
            </button>
          </>
        }
      />
      <div className="hero">
        <p className="eyebrow">No equipment</p>
        <h2>Ab Workouts</h2>
        <p>Pick a focus and go.</p>
      </div>
      <p className="chip" aria-label={`Session timing ${settings.durationMinutes} minutes, ${settings.exerciseSeconds} seconds per exercise, ${REST_SECONDS} seconds rest`}>
        {settings.durationMinutes} min · {settings.exerciseSeconds}s each · {REST_SECONDS}s rest
      </p>
      <button type="button" className="week-strip" onClick={onHistory} aria-label={`${weekLabel}. Open history.`}>
        <span className="week-strip-label">{weekLabel}</span>
        <MinutesChart days={week} mode="total" compact />
      </button>
      <button type="button" className="builder-link" onClick={onBuild}>
        Build a workout
      </button>
      <div className="tile-grid">
        {categories.map((category) => {
          const info = categoryInfo[category]
          return (
            <button
              key={category}
              type="button"
              className="tile"
              data-category={category}
              onClick={() => onStart(category)}
            >
              <StillFrame className="tile-image" src={gifUrl(categoryCovers[category]) ?? ''} alt="" />
              <span className="tile-copy">
                <span className="tile-title">{info.title}</span>
                <span className="tile-subtitle">{info.subtitle}</span>
              </span>
            </button>
          )
        })}
        {savedWorkouts.map((workout) => (
          <div key={workout.id} className="tile-wrap">
            <button type="button" className="tile" data-saved="true" onClick={() => onStartSaved(workout.id)}>
              <StillFrame className="tile-image" src={savedCover(workout)} alt="" />
              <span className="tile-copy">
                <span className="tile-title">{workout.name}</span>
                <span className="tile-subtitle">{moveCount(workout.exerciseIds.length)}</span>
              </span>
            </button>
            <button
              type="button"
              className="tile-remove"
              aria-label={`Remove ${workout.name}`}
              onClick={() => onDeleteSaved(workout.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
