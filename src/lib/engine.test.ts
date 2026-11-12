import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { catalog, categoryCovers } from '../data/catalog'
import { exerciseById, exercises, exercisesFor } from '../data/exercises'
import { categories, durationOptions, exerciseLengthOptions, type Category } from '../data/types'
import { normalizeFavoriteIds, normalizeSavedWorkouts, normalizeSettings } from './storage'
import {
  REST_SECONDS,
  buildCategoryPlan,
  buildCustomPlan,
  buildFavoritesPlan,
  consumedSeconds,
  formatDuration,
  initialTimerState,
  pauseTimer,
  previousTimer,
  sessionElapsed,
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
        expect(plan.totalSeconds).toBe(budget)
        const durations = plan.slots.map((slot) => slot.durationSeconds)
        expect(Math.min(...durations)).toBeGreaterThanOrEqual(seconds)
        expect(Math.max(...durations) - Math.min(...durations)).toBeLessThanOrEqual(1)
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

  it('repeats a short custom list and keeps a longer list intact', () => {
    const settings = { durationMinutes: 5, exerciseSeconds: 60 }
    expect(slotCount(settings)).toBe(4)
    const short = [exercises[0], exercises[1]]
    const repeated = buildCustomPlan(short, settings, ' Morning ')
    expect(repeated.title).toBe('Morning')
    expect(repeated.restSeconds).toBe(REST_SECONDS)
    expect(repeated.slots.map((slot) => slot.exercise.id)).toEqual([
      short[0].id,
      short[1].id,
      short[0].id,
      short[1].id,
    ])
    expect(repeated.totalSeconds).toBe(5 * 60)
    const longPool = exercises.slice(0, 8)
    const long = buildCustomPlan(longPool, settings, 'Long')
    expect(long.slots.map((slot) => slot.exercise.id)).toEqual(longPool.map((exercise) => exercise.id))
    expect(long.totalSeconds).toBe(8 * 60 + 7 * REST_SECONDS)
  })
})

describe('timer', () => {
  it('finishes a 10 minute session of 60 second exercises at 10 minutes', () => {
    const plan = buildCategoryPlan('upper', { durationMinutes: 10, exerciseSeconds: 60 })
    expect(plan.slots).toHaveLength(9)
    expect(plan.slots.every((slot) => slot.durationSeconds === 64)).toBe(true)
    expect(formatDuration(plan.totalSeconds)).toBe('10 min')
    let state = initialTimerState(plan)
    for (let second = 0; second < plan.totalSeconds; second += 1) {
      expect(state.done).toBe(false)
      state = stepTimer(plan, state)
    }
    expect(state.done).toBe(true)
    expect(plan.totalSeconds).toBe(600)
    expect(sessionElapsed(state.startedAt, state.startedAt + 600_000)).toBe(600)
    expect(formatDuration(sessionElapsed(state.startedAt, state.startedAt + 600_000))).toBe('10 min')
  })

  it('counts down a 30 second interval and then finishes a single move', () => {
    const plan = buildCategoryPlan('upper', { durationMinutes: 5, exerciseSeconds: 30 })
    const only = { ...plan, slots: [{ ...plan.slots[0], durationSeconds: 30 }], totalSeconds: 30 }
    let state = initialTimerState(only)
    for (let second = 0; second < 29; second += 1) state = stepTimer(only, state)
    expect(state.done).toBe(false)
    expect(state.remaining).toBe(1)
    expect(state.elapsed).toBe(0)
    state = stepTimer(only, state)
    expect(state.done).toBe(true)
    expect(state.elapsed).toBe(0)
  })

  it('measures session length on the wall clock through pause, skip, and back', () => {
    const plan = buildCategoryPlan('upper', { durationMinutes: 5, exerciseSeconds: 30 })
    const startedAt = 1_700_000_000_000
    let state = { ...initialTimerState(plan), startedAt, elapsed: 0 }
    state = pauseTimer(state)
    expect(stepTimer(plan, state)).toBe(state)
    expect(sessionElapsed(state.startedAt, startedAt + 20_000)).toBe(20)

    state = skipTimer(plan, state)
    expect(state.phase).toBe('rest')
    expect(state.startedAt).toBe(startedAt)
    expect(sessionElapsed(state.startedAt, startedAt + 25_000)).toBe(25)

    state = previousTimer(plan, state)
    expect(state.phase).toBe('work')
    expect(state.slotIndex).toBe(0)
    expect(sessionElapsed(state.startedAt, startedAt + 40_000)).toBe(40)
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
    expect(state.remaining).toBe(plan.slots[1].durationSeconds)
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
    expect(back.remaining).toBe(plan.slots[0].durationSeconds)
    const duringRest = previousTimer(plan, { ...state, phase: 'rest', remaining: 2, slotIndex: 1 })
    expect(duringRest.phase).toBe('work')
    expect(duringRest.slotIndex).toBe(1)
    expect(duringRest.remaining).toBe(plan.slots[1].durationSeconds)
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
    expect(consumedSeconds(plan, midway)).toBe(plan.slots[0].durationSeconds - 15)
    const resting = { ...start, phase: 'rest' as const, remaining: 3, elapsed: 30 }
    expect(consumedSeconds(plan, resting)).toBe(plan.slots[0].durationSeconds)
  })
})

describe('exercise catalog', () => {
  it('points every clip at a real file', () => {
    const ids = catalog.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(catalog.some((entry) => entry.id === 'v-sit-hold' || entry.id === 'floor-l-sit')).toBe(false)
    const stems = catalog.flatMap((entry) => (entry.gif ? [entry.gif] : []))
    expect(new Set(stems).size).toBe(stems.length)
    expect(stems).toHaveLength(catalog.length)
    for (const stem of stems) {
      expect(existsSync(resolve('public/exercises', `${stem}.gif`)), stem).toBe(true)
      expect(exerciseById(catalog.find((entry) => entry.gif === stem)?.id ?? ''), stem).toBeTruthy()
    }
    expect(catalog.filter((entry) => !entry.gif)).toEqual([])
    for (const category of categories) {
      const cover = catalog.find((entry) => entry.id === categoryCovers[category])
      expect(cover?.gif, category).toBeTruthy()
    }
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
    expect(normalizeFavoriteIds(['crunch', 'nope', 'v-sit-hold', 'floor-l-sit', 'crunch', 4])).toEqual(['crunch'])
    expect(
      normalizeSavedWorkouts([
        { id: 'a', name: '  Core  ', exerciseIds: ['crunch', 'nope', 'floor-l-sit', 'sit-up', 'crunch'] },
        { id: 'a', name: 'Duplicate', exerciseIds: ['crunch'] },
        { id: 'b', name: '   ', exerciseIds: ['crunch'] },
        { name: 'Missing id', exerciseIds: ['crunch'] },
      ]),
    ).toEqual([{ id: 'a', name: 'Core', exerciseIds: ['crunch', 'sit-up', 'crunch'] }])
  })

  it('uses a real category for every library move', () => {
    const allowed = new Set<Category>(categories)
    for (const exercise of exercises) {
      expect(exercise.categories.length).toBeGreaterThan(0)
      expect(exercise.categories.every((category) => allowed.has(category))).toBe(true)
    }
  })
})
