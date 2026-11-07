import { useEffect, useState } from 'react'
import { exerciseById } from './data/exercises'
import type { Category, Exercise, SavedWorkout, WorkoutSettings } from './data/types'
import { buildCategoryPlan, buildCustomPlan, buildFavoritesPlan, type WorkoutPlan } from './lib/engine'
import {
  loadCustomWorkouts,
  loadFavorites,
  loadSettings,
  normalizeSettings,
  saveCustomWorkouts,
  saveFavorites,
  saveSettings,
} from './lib/storage'
import { BuilderScreen } from './screens/BuilderScreen'
import { FavoritesScreen } from './screens/FavoritesScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SavedWorkoutsScreen } from './screens/SavedWorkoutsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'

type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'favorites' }
  | { name: 'builder' }
  | { name: 'saved' }
  | { name: 'workout'; plan: WorkoutPlan }

type NavState =
  | { name: 'home'; depth: number }
  | { name: 'settings'; depth: number }
  | { name: 'favorites'; depth: number }
  | { name: 'builder'; depth: number }
  | { name: 'saved'; depth: number }
  | { name: 'workout'; depth: number; plan: WorkoutPlan }

type NavInput =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'favorites' }
  | { name: 'builder' }
  | { name: 'saved' }
  | { name: 'workout'; plan: WorkoutPlan }

const screenNames = ['home', 'settings', 'favorites', 'builder', 'saved', 'workout'] as const

function isNavState(value: unknown): value is NavState {
  if (!value || typeof value !== 'object') return false
  const record = value as { name?: unknown; plan?: unknown }
  if (record.name === 'workout') return Boolean(record.plan && typeof record.plan === 'object')
  return typeof record.name === 'string' && screenNames.includes(record.name as (typeof screenNames)[number])
}

function routeFrom(state: NavState): Route {
  if (state.name === 'workout') return { name: 'workout', plan: state.plan }
  return { name: state.name }
}

export function App() {
  const [settings, setSettings] = useState<WorkoutSettings>(loadSettings)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites)
  const [customWorkouts, setCustomWorkouts] = useState<SavedWorkout[]>(loadCustomWorkouts)
  const [route, setRoute] = useState<Route>({ name: 'home' })

  const favoriteExercises = favoriteIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))

  useEffect(() => {
    if (!isNavState(history.state)) {
      history.replaceState({ name: 'home', depth: 0 } satisfies NavState, '')
    } else {
      setRoute(routeFrom(history.state))
    }

    const onPop = (event: PopStateEvent) => {
      if (!isNavState(event.state)) {
        setRoute({ name: 'home' })
        return
      }
      setRoute(routeFrom(event.state))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function show(state: NavState) {
    setRoute(routeFrom(state))
  }

  function push(next: NavInput) {
    const depth = (isNavState(history.state) ? history.state.depth : 0) + 1
    const state: NavState = { ...next, depth }
    history.pushState(state, '')
    show(state)
  }

  function back() {
    const depth = isNavState(history.state) ? history.state.depth : 0
    if (depth > 0) {
      history.back()
      return
    }
    show({ name: 'home', depth: 0 })
  }

  function goHome() {
    const depth = isNavState(history.state) ? history.state.depth : 0
    if (depth > 0) {
      history.go(-depth)
      return
    }
    show({ name: 'home', depth: 0 })
  }

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
    push({ name: 'workout', plan: buildCategoryPlan(category, settings) })
  }

  function startFavorites() {
    if (favoriteExercises.length === 0) return
    push({ name: 'workout', plan: buildFavoritesPlan(favoriteExercises, settings) })
  }

  function saveCustomWorkout(workout: SavedWorkout) {
    setCustomWorkouts((current) => {
      const next = [...current, workout]
      saveCustomWorkouts(next)
      return next
    })
    push({ name: 'saved' })
  }

  function deleteCustomWorkout(id: string) {
    setCustomWorkouts((current) => {
      const next = current.filter((workout) => workout.id !== id)
      saveCustomWorkouts(next)
      return next
    })
  }

  function startCustomWorkout(id: string) {
    const workout = customWorkouts.find((item) => item.id === id)
    if (!workout) return
    const pool = workout.exerciseIds
      .map((exerciseId) => exerciseById(exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
    if (pool.length === 0) return
    push({ name: 'workout', plan: buildCustomPlan(pool, settings, workout.name) })
  }

  return (
    <div className="app-shell">
      {route.name === 'home' && (
        <HomeScreen
          settings={settings}
          favoriteCount={favoriteExercises.length}
          savedCount={customWorkouts.length}
          onStart={startCategory}
          onSettings={() => push({ name: 'settings' })}
          onFavorites={() => push({ name: 'favorites' })}
          onBuild={() => push({ name: 'builder' })}
          onSaved={() => push({ name: 'saved' })}
        />
      )}
      {route.name === 'settings' && (
        <SettingsScreen settings={settings} onChange={changeSettings} onBack={back} />
      )}
      {route.name === 'builder' && <BuilderScreen onSave={saveCustomWorkout} onBack={back} />}
      {route.name === 'saved' && (
        <SavedWorkoutsScreen
          workouts={customWorkouts}
          settings={settings}
          onStart={startCustomWorkout}
          onDelete={deleteCustomWorkout}
          onBuild={() => push({ name: 'builder' })}
          onBack={back}
        />
      )}
      {route.name === 'favorites' && (
        <FavoritesScreen
          exercises={favoriteExercises}
          onRemove={toggleFavorite}
          onStart={startFavorites}
          onBack={back}
        />
      )}
      {route.name === 'workout' && (
        <WorkoutScreen
          key={route.plan.id}
          plan={route.plan}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onBack={goHome}
        />
      )}
    </div>
  )
}
