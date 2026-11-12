import { describe, expect, it } from 'vitest'
import {
  createLog,
  dailyTotals,
  formatLoggedMinutes,
  formatWeekLine,
  heatLevel,
  heatMonths,
  minutesFromSeconds,
  normalizeHistory,
  rangeMinutes,
  streakDays,
  type WorkoutLog,
} from './history'

const today = new Date(2026, 10, 8)

function log(localDate: string, elapsedSeconds: number, category: WorkoutLog['category'] = 'upper'): WorkoutLog {
  return {
    id: `${localDate}-${category}-${elapsedSeconds}`,
    completedAt: `${localDate}T18:00:00.000Z`,
    localDate,
    title: 'Upper',
    category,
    plannedSeconds: 600,
    elapsedSeconds,
    completed: true,
  }
}

describe('workout history', () => {
  it('sums the made-up week and keeps a rest day at zero', () => {
    const logs = [
      log('2026-11-02', 600),
      log('2026-11-04', 8 * 60, 'lower'),
      log('2026-11-04', 7 * 60, 'obliques'),
      log('2026-11-05', 600, 'fullCore'),
      log('2026-11-07', 600, 'upper'),
      log('2026-11-07', 600, 'lower'),
      log('2026-11-08', 8 * 60, 'fullCore'),
    ]
    const days = dailyTotals(logs, 7, today)
    expect(days.map((day) => day.weekday)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(days.map((day) => minutesFromSeconds(day.elapsedSeconds))).toEqual([10, 0, 15, 10, 0, 20, 8])
    expect(days[2].byCategory.obliques).toBe(7 * 60)
    expect(days[1].elapsedSeconds).toBe(0)
    expect(days[6].isToday).toBe(true)
    expect(rangeMinutes(logs, 7, today)).toBe(63)
    expect(streakDays(logs, today)).toBe(2)
    expect(formatWeekLine(logs, today)).toBe('63 min this week · 2 days in a row')
    expect(formatLoggedMinutes(15)).toBe('<1 min')
    expect(formatLoggedMinutes(0)).toBe('0 min')
  })

  it('keeps a streak through yesterday when today is still empty', () => {
    const logs = [log('2026-11-06', 600), log('2026-11-07', 600)]
    expect(streakDays(logs, today)).toBe(2)
    expect(streakDays([log('2026-11-06', 600)], today)).toBe(0)
  })

  it('drops invalid rows and keeps the newest 400', () => {
    const older = Array.from({ length: 401 }, (_, index) => ({
      ...log('2026-11-01', 60, 'upper'),
      id: `row-${index}`,
      completedAt: new Date(2026, 0, 1, 0, 0, index).toISOString(),
    }))
    const normalized = normalizeHistory([
      ...older,
      { id: 'bad', elapsedSeconds: -1 },
      log('2026-11-08', 30),
      log('2026-11-08', 30),
    ])
    expect(normalized).toHaveLength(400)
    expect(normalized[0].id).toBe('2026-11-08-upper-30')
    expect(normalized.some((entry) => entry.id === 'row-0')).toBe(false)
  })

  it('splits a long range into months that start on Sunday', () => {
    const days = dailyTotals([log('2026-11-08', 480, 'fullCore')], 30, today)
    const months = heatMonths(days)
    expect(months.map((month) => month.label)).toEqual(['Oct 2026', 'Nov 2026'])
    expect(months[0].cells[0].date).toBeNull()
    expect(months[0].cells.filter((cell) => cell.date === null)).toHaveLength(6)
    expect(months[1].cells.find((cell) => cell.dayOfMonth === 8)?.isToday).toBe(true)
    expect(heatLevel(480, 480)).toBe(4)
    expect(heatLevel(0, 480)).toBe(0)
  })

  it('stamps a log with the local day', () => {
    const entry = createLog({
      id: 'plan-1',
      title: 'Upper',
      category: 'upper',
      plannedSeconds: 600.8,
      elapsedSeconds: 90,
      completed: true,
      now: today,
    })
    expect(entry.localDate).toBe('2026-11-08')
    expect(entry.elapsedSeconds).toBe(90)
    expect(entry.plannedSeconds).toBe(600)
  })
})
