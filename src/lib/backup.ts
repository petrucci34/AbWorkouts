import type { WorkoutSettings } from '../data/types'
import { normalizeHistory, type WorkoutLog } from './history'
import {
  normalizeFavoriteIds,
  normalizeSavedWorkouts,
  normalizeSettings,
  type SavedWorkout,
} from './storage'

export interface BackupSnapshot {
  settings: WorkoutSettings
  favorites: string[]
  savedWorkouts: SavedWorkout[]
  history: WorkoutLog[]
}

export interface BackupFile extends BackupSnapshot {
  version: 1
  exportedAt: string
}

export function buildBackup(snapshot: BackupSnapshot, exportedAt: string): BackupFile {
  return {
    version: 1,
    exportedAt,
    settings: normalizeSettings(snapshot.settings),
    favorites: normalizeFavoriteIds(snapshot.favorites),
    savedWorkouts: normalizeSavedWorkouts(snapshot.savedWorkouts),
    history: normalizeHistory(snapshot.history),
  }
}

export function parseBackup(text: string): BackupFile | null {
  try {
    const parsed = JSON.parse(text) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Record<string, unknown>
    if (record.version !== 1 || typeof record.exportedAt !== 'string') return null
    if (!record.settings || typeof record.settings !== 'object') return null
    if (!Array.isArray(record.favorites) || !Array.isArray(record.savedWorkouts) || !Array.isArray(record.history)) {
      return null
    }
    return {
      version: 1,
      exportedAt: record.exportedAt,
      settings: normalizeSettings(record.settings),
      favorites: normalizeFavoriteIds(record.favorites),
      savedWorkouts: normalizeSavedWorkouts(record.savedWorkouts),
      history: normalizeHistory(record.history),
    }
  } catch {
    return null
  }
}

export function mergeBackup(current: BackupSnapshot, incoming: BackupFile): BackupSnapshot {
  const favoriteIds = normalizeFavoriteIds([...current.favorites, ...incoming.favorites])
  const seenWorkouts = new Set(current.savedWorkouts.map((workout) => workout.id))
  const savedWorkouts = normalizeSavedWorkouts([
    ...current.savedWorkouts,
    ...incoming.savedWorkouts.filter((workout) => !seenWorkouts.has(workout.id)),
  ])
  return {
    settings: incoming.settings,
    favorites: favoriteIds,
    savedWorkouts,
    history: normalizeHistory([...current.history, ...incoming.history]),
  }
}
