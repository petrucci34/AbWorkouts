import { exercisesFor } from '../data/exercises'
import type { Category, Exercise, WorkoutSettings } from '../data/types'

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
  elapsed: number
  paused: boolean
  done: boolean
}

export function slotCount(settings: WorkoutSettings): number {
  const total = settings.durationMinutes * 60
  const work = Math.max(settings.exerciseSeconds, 1)
  const count = Math.floor((total + REST_SECONDS) / (work + REST_SECONDS))
  return Math.max(1, count)
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
  const rests = Math.max(0, count - 1)

  return {
    id: crypto.randomUUID(),
    category,
    title: options?.title ?? categoryTitle(category),
    isFavorites: options?.isFavorites ?? false,
    settings,
    slots,
    restSeconds: REST_SECONDS,
    totalSeconds: count * settings.exerciseSeconds + rests * REST_SECONDS,
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

  const filled = slotCount(settings)
  const count = pool.length < filled ? filled : pool.length
  const slots: WorkoutSlot[] = Array.from({ length: count }, (_, index) => ({
    exercise: pool[index % pool.length],
    durationSeconds: settings.exerciseSeconds,
  }))
  const rests = Math.max(0, count - 1)

  return {
    id: crypto.randomUUID(),
    category: pool[0].categories[0] ?? 'fullCore',
    title,
    isFavorites: false,
    settings,
    slots,
    restSeconds: REST_SECONDS,
    totalSeconds: count * settings.exerciseSeconds + rests * REST_SECONDS,
  }
}

export function initialTimerState(plan: WorkoutPlan): TimerState {
  const first = plan.slots[0]
  return {
    phase: 'work',
    slotIndex: 0,
    remaining: first?.durationSeconds ?? 0,
    elapsed: 0,
    paused: false,
    done: plan.slots.length === 0,
  }
}

export function stepTimer(plan: WorkoutPlan, state: TimerState): TimerState {
  if (state.paused || state.done) return state
  if (state.remaining > 1) {
    return { ...state, remaining: state.remaining - 1, elapsed: state.elapsed + 1 }
  }
  const elapsed = state.elapsed + (state.remaining > 0 ? 1 : 0)
  return finishPhase(plan, { ...state, remaining: 0, elapsed })
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
