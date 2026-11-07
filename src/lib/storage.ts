import { exerciseById } from '../data/exercises'
import {
  durationOptions,
  exerciseLengthOptions,
  type SavedWorkout,
  type WorkoutSettings,
} from '../data/types'

const settingsKey = 'abworkouts.settings'
const favoritesKey = 'abworkouts.favorites'
const customWorkoutsKey = 'abworkouts.customWorkouts'
const maxWorkoutNameLength = 40

export const defaultSettings: WorkoutSettings = {
  durationMinutes: 10,
  exerciseSeconds: 30,
}

export function normalizeSettings(value: unknown): WorkoutSettings {
  if (!value || typeof value !== 'object') return defaultSettings
  const record = value as Record<string, unknown>
  const duration = record.durationMinutes
  const exercise = record.exerciseSeconds
  return {
    durationMinutes: durationOptions.includes(duration as (typeof durationOptions)[number])
      ? (duration as WorkoutSettings['durationMinutes'])
      : defaultSettings.durationMinutes,
    exerciseSeconds: exerciseLengthOptions.includes(exercise as (typeof exerciseLengthOptions)[number])
      ? (exercise as WorkoutSettings['exerciseSeconds'])
      : defaultSettings.exerciseSeconds,
  }
}

export function loadSettings(): WorkoutSettings {
  try {
    const raw = localStorage.getItem(settingsKey)
    if (!raw) return defaultSettings
    return normalizeSettings(JSON.parse(raw))
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: WorkoutSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(normalizeSettings(settings)))
}

export function normalizeFavoriteIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const entry of value) {
    if (typeof entry !== 'string' || seen.has(entry) || !exerciseById(entry)) continue
    seen.add(entry)
    ids.push(entry)
  }
  return ids
}

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(favoritesKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    const ids = normalizeFavoriteIds(parsed)
    if (JSON.stringify(parsed) !== JSON.stringify(ids)) saveFavorites(ids)
    return ids
  } catch {
    return []
  }
}

export function saveFavorites(ids: string[]): void {
  localStorage.setItem(favoritesKey, JSON.stringify(normalizeFavoriteIds(ids)))
}

export function normalizeCustomWorkouts(value: unknown): SavedWorkout[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const workouts: SavedWorkout[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    if (typeof record.id !== 'string' || record.id.length === 0 || seen.has(record.id)) continue
    if (typeof record.name !== 'string') continue
    const name = record.name.trim().slice(0, maxWorkoutNameLength)
    if (!name) continue
    if (!Array.isArray(record.exerciseIds)) continue
    const exerciseIds: string[] = []
    const seenExercises = new Set<string>()
    for (const id of record.exerciseIds) {
      if (typeof id !== 'string' || seenExercises.has(id) || !exerciseById(id)) continue
      seenExercises.add(id)
      exerciseIds.push(id)
    }
    if (exerciseIds.length === 0) continue
    seen.add(record.id)
    workouts.push({ id: record.id, name, exerciseIds })
  }
  return workouts
}

export function loadCustomWorkouts(): SavedWorkout[] {
  try {
    const raw = localStorage.getItem(customWorkoutsKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    const workouts = normalizeCustomWorkouts(parsed)
    if (JSON.stringify(parsed) !== JSON.stringify(workouts)) saveCustomWorkouts(workouts)
    return workouts
  } catch {
    return []
  }
}

export function saveCustomWorkouts(workouts: SavedWorkout[]): void {
  localStorage.setItem(customWorkoutsKey, JSON.stringify(normalizeCustomWorkouts(workouts)))
}
