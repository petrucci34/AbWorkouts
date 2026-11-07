import { exerciseById } from '../data/exercises'
import {
  durationOptions,
  exerciseLengthOptions,
  type WorkoutSettings,
} from '../data/types'

const settingsKey = 'abworkouts.settings'
const favoritesKey = 'abworkouts.favorites'

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
