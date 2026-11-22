import { describe, expect, it } from 'vitest'
import { buildCategoryPlan } from './engine'
import { isNavState, isWorkoutPlan, routeFrom } from './nav'

const settings = { durationMinutes: 10, exerciseSeconds: 30 }

describe('history routes', () => {
  it('accepts a category plan after a structured clone', () => {
    const plan = buildCategoryPlan('upper', settings)
    const stored = structuredClone({ name: 'workout', depth: 1, plan })
    expect(isNavState(stored)).toBe(true)
    if (!isNavState(stored) || stored.name !== 'workout') throw new Error('expected a workout entry')
    expect(routeFrom(stored).name).toBe('workout')
    expect(isWorkoutPlan(stored.plan)).toBe(true)
    expect(stored.plan.slots.map((slot) => slot.exercise.id)).toEqual(plan.slots.map((slot) => slot.exercise.id))
  })

  it('rejects a workout entry that has no plan', () => {
    expect(isNavState({ name: 'workout', depth: 1 })).toBe(false)
    expect(isNavState({ name: 'workout', depth: 1, plan: null })).toBe(false)
    expect(isWorkoutPlan(undefined)).toBe(false)
  })

  it('rejects a plan whose next move has no exercise', () => {
    const plan = buildCategoryPlan('lower', settings)
    const broken = {
      ...plan,
      slots: [{ durationSeconds: 30 }, ...plan.slots.slice(1)],
    }
    expect(isWorkoutPlan(broken)).toBe(false)
    expect(isNavState({ name: 'workout', depth: 2, plan: broken })).toBe(false)
  })

  it('still accepts the other screens', () => {
    for (const name of ['home', 'settings', 'favorites', 'builder', 'history'] as const) {
      const state = { name, depth: 1 }
      expect(isNavState(state)).toBe(true)
      if (!isNavState(state)) throw new Error(name)
      expect(routeFrom(state)).toEqual({ name })
    }
  })
})
