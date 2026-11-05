import { useCallback, useEffect, useState } from 'react'
import {
  initialTimerState,
  pauseTimer,
  skipTimer,
  stepTimer,
  type TimerState,
  type WorkoutPlan,
} from './engine'

export function useWorkoutTimer(plan: WorkoutPlan): {
  state: TimerState
  togglePause: () => void
  skip: () => void
} {
  const [state, setState] = useState(() => initialTimerState(plan))

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((current) => stepTimer(plan, current))
    }, 1000)
    return () => window.clearInterval(id)
  }, [plan])

  const togglePause = useCallback(() => {
    setState((current) => pauseTimer(current))
  }, [])

  const skip = useCallback(() => {
    setState((current) => skipTimer(plan, current))
  }, [plan])

  return { state, togglePause, skip }
}
