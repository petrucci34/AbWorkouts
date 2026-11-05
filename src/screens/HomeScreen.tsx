import { categories, categoryInfo, type Category, type WorkoutSettings } from '../data/types'
import { REST_SECONDS } from '../lib/engine'
import { SlidersIcon, StarIcon } from '../components/Icons'
import { TopBar } from '../components/TopBar'

export function HomeScreen({
  settings,
  favoriteCount,
  onStart,
  onSettings,
  onFavorites,
}: {
  settings: WorkoutSettings
  favoriteCount: number
  onStart: (category: Category) => void
  onSettings: () => void
  onFavorites: () => void
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
              <span className="tile-mark" aria-hidden="true" />
              <span className="tile-copy">
                <span className="tile-title">{info.title}</span>
                <span className="tile-subtitle">{info.subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
