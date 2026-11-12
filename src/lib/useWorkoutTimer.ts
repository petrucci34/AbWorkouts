import { useCallback, useEffect, useState } from 'react'
import {
  initialTimerState,
  pauseTimer,
  previousTimer,
  sessionElapsed,
  skipTimer,
  stepTimer,
  type TimerState,
  type WorkoutPlan,
} from './engine'

export function useWorkoutTimer(plan: WorkoutPlan): {
  state: TimerState
  togglePause: () => void
  skip: () => void
  previous: () => void
} {
  const [state, setState] = useState(() => initialTimerState(plan))

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now()
      setState((current) => stampElapsed(current, stepTimer(plan, current), now))
    }, 1000)
    return () => window.clearInterval(id)
  }, [plan])

  const togglePause = useCallback(() => {
    const now = Date.now()
    setState((current) => stampElapsed(current, pauseTimer(current), now))
  }, [])

  const skip = useCallback(() => {
    const now = Date.now()
    setState((current) => stampElapsed(current, skipTimer(plan, current), now))
  }, [plan])

  const previous = useCallback(() => {
    const now = Date.now()
    setState((current) => stampElapsed(current, previousTimer(plan, current), now))
  }, [plan])

  return { state, togglePause, skip, previous }
}

function stampElapsed(current: TimerState, next: TimerState, now: number): TimerState {
  if (current.done) return current
  const elapsed = sessionElapsed(current.startedAt, now)
  if (next.done) return { ...next, elapsed }
  if (next === current && current.elapsed === elapsed) return current
  return { ...next, elapsed }
}
