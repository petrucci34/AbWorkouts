import { useState } from 'react'
import { exerciseById } from './data/exercises'
import type { Category, Exercise, WorkoutSettings } from './data/types'
import { buildCategoryPlan, buildFavoritesPlan, type WorkoutPlan } from './lib/engine'
import { loadFavorites, loadSettings, normalizeSettings, saveFavorites, saveSettings } from './lib/storage'
import { FavoritesScreen } from './screens/FavoritesScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'favorites' }
  | { name: 'workout'; plan: WorkoutPlan }

export function App() {
  const [settings, setSettings] = useState<WorkoutSettings>(loadSettings)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites)
  const [route, setRoute] = useState<Route>({ name: 'home' })

  const favoriteExercises = favoriteIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))

  function changeSettings(next: WorkoutSettings) {
    const clean = normalizeSettings(next)
    setSettings(clean)
    saveSettings(clean)
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      saveFavorites(next)
      return next
    })
  }

  function startCategory(category: Category) {
    setRoute({ name: 'workout', plan: buildCategoryPlan(category, settings) })
  }

  function startFavorites() {
    if (favoriteExercises.length === 0) return
    setRoute({ name: 'workout', plan: buildFavoritesPlan(favoriteExercises, settings) })
  }

  return (
    <div className="app-shell">
      {route.name === 'home' && (
        <HomeScreen
          settings={settings}
          favoriteCount={favoriteExercises.length}
          onStart={startCategory}
          onSettings={() => setRoute({ name: 'settings' })}
          onFavorites={() => setRoute({ name: 'favorites' })}
        />
      )}
      {route.name === 'settings' && (
        <SettingsScreen settings={settings} onChange={changeSettings} onBack={() => setRoute({ name: 'home' })} />
      )}
      {route.name === 'favorites' && (
        <FavoritesScreen
          exercises={favoriteExercises}
          onRemove={toggleFavorite}
          onStart={startFavorites}
          onBack={() => setRoute({ name: 'home' })}
        />
      )}
      {route.name === 'workout' && (
        <WorkoutScreen
          key={route.plan.id}
          plan={route.plan}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onEnd={() => setRoute({ name: 'home' })}
        />
      )}
    </div>
  )
}
