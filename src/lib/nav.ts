import type { WorkoutPlan, WorkoutSlot } from './engine'

export type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'favorites' }
  | { name: 'builder' }
  | { name: 'history' }
  | { name: 'workout'; plan: WorkoutPlan }

export type NavState =
  | { name: 'home'; depth: number }
  | { name: 'settings'; depth: number }
  | { name: 'favorites'; depth: number }
  | { name: 'builder'; depth: number }
  | { name: 'history'; depth: number }
  | { name: 'workout'; depth: number; plan: WorkoutPlan }

export type NavInput =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'favorites' }
  | { name: 'builder' }
  | { name: 'history' }
  | { name: 'workout'; plan: WorkoutPlan }

export function isWorkoutPlan(value: unknown): value is WorkoutPlan {
  if (!value || typeof value !== 'object') return false
  const plan = value as Partial<WorkoutPlan>
  if (typeof plan.id !== 'string' || plan.id.length === 0) return false
  if (!Array.isArray(plan.slots) || plan.slots.length === 0) return false
  return plan.slots.every(isWorkoutSlot)
}

function isWorkoutSlot(value: unknown): value is WorkoutSlot {
  if (!value || typeof value !== 'object') return false
  const slot = value as Partial<WorkoutSlot>
  const exercise = slot.exercise
  return (
    typeof slot.durationSeconds === 'number' &&
    Number.isFinite(slot.durationSeconds) &&
    !!exercise &&
    typeof exercise.id === 'string' &&
    exercise.id.length > 0 &&
    typeof exercise.name === 'string'
  )
}

export function isNavState(value: unknown): value is NavState {
  if (!value || typeof value !== 'object') return false
  const record = value as { name?: unknown; plan?: unknown }
  if (record.name === 'workout') return isWorkoutPlan(record.plan)
  return (
    record.name === 'home' ||
    record.name === 'settings' ||
    record.name === 'favorites' ||
    record.name === 'builder' ||
    record.name === 'history'
  )
}

export function routeFrom(state: NavState): Route {
  if (state.name === 'workout') return { name: 'workout', plan: state.plan }
  return { name: state.name }
}
