import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { exerciseById, exercises, exercisesFor } from '../data/exercises'
import { purchaseStemToExerciseId } from '../data/media'
import { categories, durationOptions, exerciseLengthOptions, type Category } from '../data/types'
import { normalizeFavoriteIds, normalizeSettings } from './storage'
import {
  REST_SECONDS,
  buildCategoryPlan,
  buildFavoritesPlan,
  consumedSeconds,
  initialTimerState,
  pauseTimer,
  previousTimer,
  skipTimer,
  slotCount,
  stepTimer,
} from './engine'

describe('workout plans', () => {
  it('fills the selected duration with work and 3 second rests', () => {
    for (const minutes of durationOptions) {
      for (const seconds of exerciseLengthOptions) {
        const settings = { durationMinutes: minutes, exerciseSeconds: seconds }
        const plan = buildCategoryPlan('upper', settings)
        const budget = minutes * 60
        expect(plan.restSeconds).toBe(REST_SECONDS)
        expect(plan.slots.length).toBe(slotCount(settings))
        expect(plan.totalSeconds).toBeLessThanOrEqual(budget)
        expect(plan.totalSeconds + seconds + REST_SECONDS).toBeGreaterThan(budget)
        expect(plan.slots.every((slot) => slot.durationSeconds === seconds)).toBe(true)
        expect(plan.slots.every((slot) => slot.exercise.categories.includes('upper'))).toBe(true)
      }
    }
  })

  it('cycles the category pool', () => {
    const settings = { durationMinutes: 8, exerciseSeconds: 60 }
    const plan = buildCategoryPlan('fullCore', settings)
    const pool = exercisesFor('fullCore')
    expect(pool.length).toBeGreaterThan(0)
    plan.slots.forEach((slot, index) => {
      expect(slot.exercise.id).toBe(pool[index % pool.length].id)
    })
  })

  it('gives every category at least one move', () => {
    for (const category of categories) {
      expect(exercisesFor(category).length).toBeGreaterThan(0)
    }
  })

  it('builds a favorites session from the saved moves', () => {
    const pool = [exercises[0], exercises[5]]
    const plan = buildFavoritesPlan(pool, { durationMinutes: 5, exerciseSeconds: 60 })
    expect(plan.isFavorites).toBe(true)
    expect(plan.title).toBe('Favorites')
    expect(plan.slots[0].exercise.id).toBe(pool[0].id)
    expect(plan.slots[1].exercise.id).toBe(pool[1].id)
    expect(plan.slots[2].exercise.id).toBe(pool[0].id)
  })
})

describe('timer', () => {
  it('counts down a 30 second interval and then finishes a single move', () => {
    const plan = buildCategoryPlan('upper', { durationMinutes: 5, exerciseSeconds: 30 })
    const only = { ...plan, slots: [plan.slots[0]], totalSeconds: 30 }
    let state = initialTimerState(only)
    for (let second = 0; second < 29; second += 1) state = stepTimer(only, state)
    expect(state.done).toBe(false)
    expect(state.remaining).toBe(1)
    expect(state.elapsed).toBe(29)
    state = stepTimer(only, state)
    expect(state.done).toBe(true)
    expect(state.elapsed).toBe(30)
  })

  it('inserts a 3 second rest between moves and skip jumps the phase', () => {
    const plan = buildCategoryPlan('lower', { durationMinutes: 5, exerciseSeconds: 30 })
    let state = initialTimerState(plan)
    state = skipTimer(plan, state)
    expect(state.phase).toBe('rest')
    expect(state.remaining).toBe(3)
    expect(state.slotIndex).toBe(0)
    expect(state.elapsed).toBe(0)
    state = skipTimer(plan, state)
    expect(state.phase).toBe('work')
    expect(state.slotIndex).toBe(1)
    expect(state.remaining).toBe(30)
  })

  it('steps back to the previous exercise and replays the move before a rest', () => {
    const plan = buildCategoryPlan('lower', { durationMinutes: 5, exerciseSeconds: 30 })
    const start = initialTimerState(plan)
    expect(previousTimer(plan, start)).toBe(start)
    let state = skipTimer(plan, start)
    state = skipTimer(plan, state)
    const back = previousTimer(plan, state)
    expect(back.slotIndex).toBe(0)
    expect(back.phase).toBe('work')
    expect(back.remaining).toBe(30)
    const duringRest = previousTimer(plan, { ...state, phase: 'rest', remaining: 2, slotIndex: 1 })
    expect(duringRest.phase).toBe('work')
    expect(duringRest.slotIndex).toBe(1)
    expect(duringRest.remaining).toBe(30)
  })

  it('does not advance while paused', () => {
    const plan = buildCategoryPlan('obliques', { durationMinutes: 5, exerciseSeconds: 30 })
    const paused = pauseTimer(initialTimerState(plan))
    expect(stepTimer(plan, paused)).toBe(paused)
  })

  it('tracks progress through the current interval', () => {
    const plan = buildCategoryPlan('upper', { durationMinutes: 5, exerciseSeconds: 30 })
    const start = initialTimerState(plan)
    expect(consumedSeconds(plan, start)).toBe(0)
    const midway = { ...start, remaining: 15, elapsed: 15 }
    expect(consumedSeconds(plan, midway)).toBe(15)
    const resting = { ...start, phase: 'rest' as const, remaining: 3, elapsed: 30 }
    expect(consumedSeconds(plan, resting)).toBe(30)
  })
})

describe('purchased gifs', () => {
  it('maps every purchased file onto a library exercise', () => {
    expect(Object.keys(purchaseStemToExerciseId)).toHaveLength(27)
    expect(purchaseStemToExerciseId['front-plank']).toBe('forearm-plank')
    expect(purchaseStemToExerciseId['hollow-hold']).toBe('hollow-body-hold')
    expect(purchaseStemToExerciseId['lying-toe-touch']).toBe('toe-touch')
    for (const id of new Set(Object.values(purchaseStemToExerciseId))) {
      expect(exerciseById(id), id).toBeTruthy()
      expect(existsSync(resolve('public/exercises', `${id}.gif`)), id).toBe(true)
    }
  })

  it('leaves only scissor kicks without a clip', () => {
    const wired = new Set(Object.values(purchaseStemToExerciseId))
    const missing = exercises.filter((exercise) => !wired.has(exercise.id)).map((exercise) => exercise.id)
    expect(missing).toEqual(['scissor-kicks'])
  })
})

describe('saved settings', () => {
  it('rejects durations and exercise lengths outside the product options', () => {
    expect(normalizeSettings({ durationMinutes: 12, exerciseSeconds: 45 })).toEqual({
      durationMinutes: 10,
      exerciseSeconds: 30,
    })
    expect(normalizeSettings({ durationMinutes: 15, exerciseSeconds: 60 })).toEqual({
      durationMinutes: 15,
      exerciseSeconds: 60,
    })
    expect(normalizeFavoriteIds(['crunch', 'nope', 'crunch', 4])).toEqual(['crunch'])
  })

  it('uses a real category for every library move', () => {
    const allowed = new Set<Category>(categories)
    for (const exercise of exercises) {
      expect(exercise.categories.length).toBeGreaterThan(0)
      expect(exercise.categories.every((category) => allowed.has(category))).toBe(true)
    }
  })
})
