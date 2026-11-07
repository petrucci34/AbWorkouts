import { assetUrl } from '../data/media'
import { categories, categoryInfo, type Category, type WorkoutSettings } from '../data/types'
import { REST_SECONDS } from '../lib/engine'
import type { SavedWorkout } from '../lib/storage'
import { SlidersIcon, StarIcon } from '../components/Icons'
import { StillFrame } from '../components/StillFrame'
import { TopBar } from '../components/TopBar'

const categoryImage: Record<Category, string> = {
  upper: assetUrl('exercises/crunch.gif'),
  lower: assetUrl('exercises/lying-leg-raise.gif'),
  obliques: assetUrl('exercises/bicycle-crunch.gif'),
  fullCore: assetUrl('exercises/forearm-plank.gif'),
}

export function HomeScreen({
  settings,
  favoriteCount,
  savedWorkouts,
  onStart,
  onSettings,
  onFavorites,
  onBuild,
  onStartSaved,
  onDeleteSaved,
}: {
  settings: WorkoutSettings
  favoriteCount: number
  savedWorkouts: SavedWorkout[]
  onStart: (category: Category) => void
  onSettings: () => void
  onFavorites: () => void
  onBuild: () => void
  onStartSaved: (id: string) => void
  onDeleteSaved: (id: string) => void
}) {
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
              <StillFrame className="tile-image" src={categoryImage[category]} alt="" />
              <span className="tile-copy">
                <span className="tile-title">{info.title}</span>
                <span className="tile-subtitle">{info.subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>
      {savedWorkouts.length > 0 && (
        <div className="settings-block">
          <h2>Saved workouts</h2>
          <ul className="favorite-list">
            {savedWorkouts.map((workout) => (
              <li key={workout.id}>
                <button type="button" className="saved-start" onClick={() => onStartSaved(workout.id)}>
                  <span className="favorite-name">{workout.name}</span>
                  <span className="favorite-meta">{workout.exerciseIds.length} moves</span>
                </button>
                <button type="button" className="text-btn text-btn-muted" onClick={() => onDeleteSaved(workout.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
