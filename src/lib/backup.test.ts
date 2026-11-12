import { describe, expect, it } from 'vitest'
import { buildBackup, mergeBackup, parseBackup, type BackupSnapshot } from './backup'
import type { WorkoutLog } from './history'

const current: BackupSnapshot = {
  settings: { durationMinutes: 10, exerciseSeconds: 30 },
  favorites: ['crunch'],
  savedWorkouts: [{ id: 'local', name: 'Morning', exerciseIds: ['crunch'] }],
  history: [session('local-session', '2026-11-08')],
}

function session(id: string, localDate: string): WorkoutLog {
  return {
    id,
    completedAt: `${localDate}T18:00:00.000Z`,
    localDate,
    title: 'Upper',
    category: 'upper',
    plannedSeconds: 600,
    elapsedSeconds: 600,
    completed: true,
  }
}

describe('backup file', () => {
  it('merges sessions and favorites, and replaces settings', () => {
    const incoming = buildBackup(
      {
        settings: { durationMinutes: 15, exerciseSeconds: 60 },
        favorites: ['crunch', 'sit-up'],
        savedWorkouts: [
          { id: 'local', name: 'Changed', exerciseIds: ['sit-up'] },
          { id: 'phone', name: 'Travel', exerciseIds: ['plank-shoulder-taps'] },
        ],
        history: [session('local-session', '2026-11-08'), session('phone-session', '2026-11-07')],
      },
      '2026-11-08T00:00:00.000Z',
    )
    const merged = mergeBackup(current, incoming)
    expect(merged.settings).toEqual({ durationMinutes: 15, exerciseSeconds: 60 })
    expect(merged.favorites).toEqual(['crunch', 'sit-up'])
    expect(merged.savedWorkouts.map((workout) => workout.id)).toEqual(['local', 'phone'])
    expect(merged.savedWorkouts[0].name).toBe('Morning')
    expect(merged.history.map((log) => log.id)).toEqual(['local-session', 'phone-session'])
  })

  it('rejects a file that is not a backup', () => {
    expect(parseBackup('{"version":1}')).toBeNull()
    expect(parseBackup('not json')).toBeNull()
    const file = buildBackup(current, '2026-11-08T00:00:00.000Z')
    expect(parseBackup(JSON.stringify(file))?.history).toHaveLength(1)
  })
})
