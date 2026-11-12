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
      setState((current) => {
        if (current.done) return current
        const elapsed = sessionElapsed(current.startedAt, now)
        const stepped = stepTimer(plan, current)
        if (stepped.done) return { ...stepped, elapsed }
        if (stepped === current && current.elapsed === elapsed) return current
        return { ...stepped, elapsed }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [plan])

  const togglePause = useCallback(() => {
    setState((current) => pauseTimer(current))
  }, [])

  const skip = useCallback(() => {
    setState((current) => skipTimer(plan, current))
  }, [plan])

  const previous = useCallback(() => {
    setState((current) => previousTimer(plan, current))
  }, [plan])

  return { state, togglePause, skip, previous }
}
