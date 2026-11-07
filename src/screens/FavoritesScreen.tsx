import { categoryInfo, type Exercise } from '../data/types'
import { TopBar } from '../components/TopBar'

export function FavoritesScreen({
  exercises,
  onRemove,
  onStart,
  onBack,
}: {
  exercises: Exercise[]
  onRemove: (id: string) => void
  onStart: () => void
  onBack: () => void
}) {
  return (
    <section className="screen screen-scroll">
      <TopBar
        title="Favorites"
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            Back
          </button>
        }
      />
      {exercises.length === 0 ? (
        <div className="empty">
          <h2>No favorites yet</h2>
          <p>Star an exercise during a workout and it will show up here.</p>
        </div>
      ) : (
        <ul className="favorite-list">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <div>
                <p className="favorite-name">{exercise.name}</p>
                <p className="favorite-meta">
                  {exercise.categories.map((category) => categoryInfo[category].title).join(' · ')}
                </p>
              </div>
              <button type="button" className="text-btn" onClick={() => onRemove(exercise.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {exercises.length > 0 && (
        <button type="button" className="primary" onClick={onStart}>
          Start favorites
        </button>
      )}
    </section>
  )
}
