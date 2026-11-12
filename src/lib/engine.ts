import { exercisesFor } from '../data/exercises'
import {
  durationOptions,
  exerciseLengthOptions,
  type Category,
  type Exercise,
  type WorkoutSettings,
} from '../data/types'

export const REST_SECONDS = 3

export interface WorkoutSlot {
  exercise: Exercise
  durationSeconds: number
}

export interface WorkoutPlan {
  id: string
  category: Category
  title: string
  isFavorites: boolean
  settings: WorkoutSettings
  slots: WorkoutSlot[]
  restSeconds: number
  totalSeconds: number
}

export type TimerPhase = 'work' | 'rest'

export interface TimerState {
  phase: TimerPhase
  slotIndex: number
  remaining: number
  /** Wall-clock seconds since the session began. Frozen once `done` is set. */
  elapsed: number
  /** Epoch ms when the session began. Elapsed keeps running through pause, skip, and back. */
  startedAt: number
  paused: boolean
  done: boolean
}

type SessionMinutes = (typeof durationOptions)[number]
type ExerciseLength = (typeof exerciseLengthOptions)[number]

/**
 * Exercises in a session, listed as 30s then 60s.
 * The rests sit between those exercises, so the session runs a little past the labeled minutes.
 */
export const exerciseCounts: Record<SessionMinutes, Record<ExerciseLength, number>> = {
  5: { 30: 10, 60: 5 },
  8: { 30: 16, 60: 8 },
  10: { 30: 20, 60: 10 },
  15: { 30: 30, 60: 15 },
  20: { 30: 40, 60: 20 },
}

export function slotCount(settings: WorkoutSettings): number {
  const minutes = settings.durationMinutes
  const seconds = settings.exerciseSeconds
  if (isSessionMinutes(minutes) && isExerciseLength(seconds)) {
    return exerciseCounts[minutes][seconds]
  }
  const work = Math.max(seconds, 1)
  return Math.max(1, Math.round((Math.max(minutes, 0) * 60) / work))
}

function sessionSeconds(count: number, exerciseSeconds: number): number {
  return count * exerciseSeconds + Math.max(0, count - 1) * REST_SECONDS
}

function isSessionMinutes(value: number): value is SessionMinutes {
  return (durationOptions as readonly number[]).includes(value)
}

function isExerciseLength(value: number): value is ExerciseLength {
  return (exerciseLengthOptions as readonly number[]).includes(value)
}

export function buildPlan(
  pool: Exercise[],
  category: Category,
  settings: WorkoutSettings,
  options?: { title?: string; isFavorites?: boolean },
): WorkoutPlan {
  if (pool.length === 0) {
    throw new Error('Cannot build a workout with no exercises')
  }

  const count = slotCount(settings)
  const slots: WorkoutSlot[] = Array.from({ length: count }, (_, index) => ({
    exercise: pool[index % pool.length],
    durationSeconds: settings.exerciseSeconds,
  }))

  return {
    id: crypto.randomUUID(),
    category,
    title: options?.title ?? categoryTitle(category),
    isFavorites: options?.isFavorites ?? false,
    settings,
    slots,
    restSeconds: REST_SECONDS,
    totalSeconds: sessionSeconds(count, settings.exerciseSeconds),
  }
}

export function buildCategoryPlan(category: Category, settings: WorkoutSettings): WorkoutPlan {
  return buildPlan(exercisesFor(category), category, settings)
}

export function buildFavoritesPlan(pool: Exercise[], settings: WorkoutSettings): WorkoutPlan {
  const category = pool[0]?.categories[0] ?? 'fullCore'
  return buildPlan(pool, category, settings, { title: 'Favorites', isFavorites: true })
}

export function buildCustomPlan(pool: Exercise[], settings: WorkoutSettings, title: string): WorkoutPlan {
  if (pool.length === 0) {
    throw new Error('Cannot build a workout with no exercises')
  }
  const fitted = slotCount(settings)
  const chosen = pool.length > fitted ? pool : Array.from({ length: fitted }, (_, index) => pool[index % pool.length])
  const slots: WorkoutSlot[] = chosen.map((exercise) => ({
    exercise,
    durationSeconds: settings.exerciseSeconds,
  }))
  const name = title.trim() || 'Custom'
  return {
    id: crypto.randomUUID(),
    category: pool[0].categories[0] ?? 'fullCore',
    title: name,
    isFavorites: false,
    settings,
    slots,
    restSeconds: REST_SECONDS,
    totalSeconds: sessionSeconds(slots.length, settings.exerciseSeconds),
  }
}

export function initialTimerState(plan: WorkoutPlan): TimerState {
  const first = plan.slots[0]
  return {
    phase: 'work',
    slotIndex: 0,
    remaining: first?.durationSeconds ?? 0,
    elapsed: 0,
    startedAt: Date.now(),
    paused: false,
    done: plan.slots.length === 0,
  }
}

export function stepTimer(plan: WorkoutPlan, state: TimerState): TimerState {
  if (state.paused || state.done) return state
  if (state.remaining > 1) {
    return { ...state, remaining: state.remaining - 1 }
  }
  return finishPhase(plan, { ...state, remaining: 0 })
}

/** Seconds from session start to `now`. Pause, skip, and previous do not stop this clock. */
export function sessionElapsed(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000))
}

export function skipTimer(plan: WorkoutPlan, state: TimerState): TimerState {
  if (state.done) return state
  return finishPhase(plan, state)
}

export function previousTimer(plan: WorkoutPlan, state: TimerState): TimerState {
  if (state.done || plan.slots.length === 0) return state
  if (state.phase === 'rest') {
    const slot = plan.slots[state.slotIndex]
    if (!slot) return state
    return { ...state, phase: 'work', remaining: slot.durationSeconds }
  }
  if (state.slotIndex <= 0) return state
  const index = state.slotIndex - 1
  const slot = plan.slots[index]
  return {
    ...state,
    phase: 'work',
    slotIndex: index,
    remaining: slot.durationSeconds,
  }
}

export function pauseTimer(state: TimerState): TimerState {
  if (state.done) return state
  return { ...state, paused: !state.paused }
}

export function consumedSeconds(plan: WorkoutPlan, state: TimerState): number {
  let consumed = 0
  const prior = Math.min(state.slotIndex, plan.slots.length)
  for (let index = 0; index < prior; index += 1) {
    consumed += plan.slots[index].durationSeconds + plan.restSeconds
  }
  const slot = plan.slots[state.slotIndex]
  if (!slot || state.done) return state.done ? plan.totalSeconds : consumed
  if (state.phase === 'work') {
    consumed += slot.durationSeconds - state.remaining
  } else {
    consumed += slot.durationSeconds + (plan.restSeconds - state.remaining)
  }
  return Math.max(0, Math.min(plan.totalSeconds, consumed))
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const remain = safe % 60
  return `${minutes}:${remain.toString().padStart(2, '0')}`
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds}s`
}

function finishPhase(plan: WorkoutPlan, state: TimerState): TimerState {
  if (state.done) return state
  if (state.phase === 'work') {
    if (state.slotIndex + 1 < plan.slots.length) {
      return { ...state, phase: 'rest', remaining: plan.restSeconds }
    }
    return { ...state, done: true, remaining: 0 }
  }
  const next = state.slotIndex + 1
  const slot = plan.slots[next]
  if (!slot) return { ...state, done: true, remaining: 0 }
  return {
    ...state,
    phase: 'work',
    slotIndex: next,
    remaining: slot.durationSeconds,
  }
}

function categoryTitle(category: Category): string {
  switch (category) {
    case 'upper':
      return 'Upper'
    case 'lower':
      return 'Lower'
    case 'obliques':
      return 'Obliques'
    case 'fullCore':
      return 'Full core'
  }
}
