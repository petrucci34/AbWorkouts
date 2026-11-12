import { categories, type Category } from '../data/types'

export const HISTORY_LIMIT = 400
export const MIN_LOG_SECONDS = 30

export interface WorkoutLog {
  id: string
  completedAt: string
  localDate: string
  title: string
  category: Category
  plannedSeconds: number
  elapsedSeconds: number
  completed: boolean
}

export interface DayTotal {
  date: string
  weekday: string
  dayOfMonth: number
  elapsedSeconds: number
  byCategory: Record<Category, number>
  isToday: boolean
}

export interface HeatCell {
  date: string | null
  dayOfMonth: number | null
  elapsedSeconds: number
  isToday: boolean
}

export interface HeatMonth {
  key: string
  label: string
  cells: HeatCell[]
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function localDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function minutesFromSeconds(seconds: number): number {
  return Math.round(seconds / 60)
}

export function formatLoggedMinutes(seconds: number): string {
  const minutes = minutesFromSeconds(seconds)
  if (seconds > 0 && minutes === 0) return '<1 min'
  return `${minutes} min`
}

export function formatDayLabel(localDate: string): string {
  const [year, month, day] = localDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return `${monthNames[date.getMonth()]} ${date.getDate()}`
}

export function createLog(input: {
  id: string
  title: string
  category: Category
  plannedSeconds: number
  elapsedSeconds: number
  completed: boolean
  now: Date
}): WorkoutLog {
  return {
    id: input.id,
    completedAt: input.now.toISOString(),
    localDate: localDateString(input.now),
    title: input.title,
    category: input.category,
    plannedSeconds: Math.max(0, Math.floor(input.plannedSeconds)),
    elapsedSeconds: Math.max(0, Math.floor(input.elapsedSeconds)),
    completed: input.completed,
  }
}

export function normalizeHistory(value: unknown): WorkoutLog[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const logs: WorkoutLog[] = []
  for (const entry of value) {
    const log = parseLog(entry)
    if (!log || seen.has(log.id)) continue
    seen.add(log.id)
    logs.push(log)
  }
  logs.sort((a, b) => (a.completedAt < b.completedAt ? 1 : a.completedAt > b.completedAt ? -1 : 0))
  return logs.slice(0, HISTORY_LIMIT)
}

export function dailyTotals(logs: WorkoutLog[], dayCount: number, today: Date): DayTotal[] {
  const start = shiftDays(today, -(dayCount - 1))
  const totals = new Map<string, DayTotal>()
  for (let index = 0; index < dayCount; index += 1) {
    const date = shiftDays(start, index)
    const key = localDateString(date)
    totals.set(key, {
      date: key,
      weekday: weekdays[date.getDay()],
      dayOfMonth: date.getDate(),
      elapsedSeconds: 0,
      byCategory: emptyCategories(),
      isToday: index === dayCount - 1,
    })
  }
  for (const log of logs) {
    const bucket = totals.get(log.localDate)
    if (!bucket) continue
    bucket.elapsedSeconds += log.elapsedSeconds
    bucket.byCategory[log.category] += log.elapsedSeconds
  }
  return Array.from(totals.values())
}

export function heatMonths(days: DayTotal[]): HeatMonth[] {
  const groups: DayTotal[][] = []
  for (const day of days) {
    const key = day.date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (!last || !last[0].date.startsWith(key)) groups.push([day])
    else last.push(day)
  }
  return groups.map((group) => {
    const [year, month, day] = group[0].date.split('-').map(Number)
    const leading = new Date(year, month - 1, day).getDay()
    const blanks: HeatCell[] = Array.from({ length: leading }, () => ({
      date: null,
      dayOfMonth: null,
      elapsedSeconds: 0,
      isToday: false,
    }))
    return {
      key: group[0].date.slice(0, 7),
      label: `${monthNames[month - 1]} ${year}`,
      cells: [
        ...blanks,
        ...group.map((entry) => ({
          date: entry.date,
          dayOfMonth: entry.dayOfMonth,
          elapsedSeconds: entry.elapsedSeconds,
          isToday: entry.isToday,
        })),
      ],
    }
  })
}

export function heatLevel(seconds: number, maxSeconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds <= 0 || maxSeconds <= 0) return 0
  const ratio = seconds / maxSeconds
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

export function logsInRange(logs: WorkoutLog[], dayCount: number, today: Date): WorkoutLog[] {
  const dates = new Set(dailyTotals(logs, dayCount, today).map((day) => day.date))
  return logs.filter((log) => dates.has(log.localDate))
}

export function rangeMinutes(logs: WorkoutLog[], dayCount: number, today: Date): number {
  const seconds = dailyTotals(logs, dayCount, today).reduce((sum, day) => sum + day.elapsedSeconds, 0)
  return minutesFromSeconds(seconds)
}

export function streakDays(logs: WorkoutLog[], today: Date): number {
  const active = new Set(logs.filter((log) => log.elapsedSeconds > 0).map((log) => log.localDate))
  let cursor = shiftDays(today, 0)
  if (!active.has(localDateString(cursor))) cursor = shiftDays(cursor, -1)
  let streak = 0
  while (active.has(localDateString(cursor))) {
    streak += 1
    cursor = shiftDays(cursor, -1)
  }
  return streak
}

export function formatWeekLine(logs: WorkoutLog[], today: Date): string {
  const total = `${rangeMinutes(logs, 7, today)} min this week`
  const streak = streakDays(logs, today)
  return streak >= 2 ? `${total} · ${streak} days in a row` : total
}

export function rangeHeadline(logs: WorkoutLog[], dayCount: number, today: Date): string {
  if (logs.length === 0) return 'No sessions yet'
  const minutes = rangeMinutes(logs, dayCount, today)
  const total = dayCount === 7 ? `${minutes} min this week` : `${minutes} min in ${dayCount} days`
  const streak = streakDays(logs, today)
  return streak >= 2 ? `${total} · ${streak} days in a row` : total
}

function parseLog(value: unknown): WorkoutLog | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || record.id.trim() === '') return null
  if (typeof record.completedAt !== 'string' || Number.isNaN(Date.parse(record.completedAt))) return null
  if (typeof record.localDate !== 'string' || !isRealDate(record.localDate)) return null
  if (typeof record.title !== 'string' || record.title.trim() === '') return null
  if (!categories.includes(record.category as Category)) return null
  if (typeof record.completed !== 'boolean') return null
  const planned = wholeSeconds(record.plannedSeconds)
  const elapsed = wholeSeconds(record.elapsedSeconds)
  if (planned === null || elapsed === null) return null
  return {
    id: record.id,
    completedAt: record.completedAt,
    localDate: record.localDate,
    title: record.title.trim(),
    category: record.category as Category,
    plannedSeconds: planned,
    elapsedSeconds: elapsed,
    completed: record.completed,
  }
}

function wholeSeconds(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return Math.floor(value)
}

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function shiftDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function emptyCategories(): Record<Category, number> {
  return { upper: 0, lower: 0, obliques: 0, fullCore: 0 }
}
