import { useEffect } from 'react'
import { ExerciseDemo } from '../components/LoopingGif'
import { CheckIcon, StarIcon } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import {
  consumedSeconds,
  formatClock,
  formatDuration,
  type WorkoutPlan,
} from '../lib/engine'
import { useWorkoutTimer } from '../lib/useWorkoutTimer'

export function WorkoutScreen({
  plan,
  favoriteIds,
  onToggleFavorite,
  onBack,
}: {
  plan: WorkoutPlan
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onBack: () => void
}) {
  const { state, togglePause, skip, previous } = useWorkoutTimer(plan)
  const slot = plan.slots[state.slotIndex]
  const next = plan.slots[state.slotIndex + 1]
  const shown = state.phase === 'rest' && next ? next.exercise : slot?.exercise
  const starred = shown ? favoriteIds.includes(shown.id) : false
  const progress = plan.totalSeconds === 0 ? 0 : consumedSeconds(plan, state) / plan.totalSeconds
  const upNext = next ? next.exercise.name : 'Finish'

  useEffect(() => {
    let released = false
    let sentinel: WakeLockSentinel | null = null
    const request = async () => {
      try {
        if (released || !('wakeLock' in navigator)) return
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        sentinel = null
      }
    }
    void request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release()
    }
  }, [])

  if (state.done || !shown || !slot) {
    return (
      <section className="screen complete">
        <CheckIcon />
        <h2>Session done</h2>
        <p>
          {plan.title} · {formatDuration(state.elapsed)}
        </p>
        <button type="button" className="primary" onClick={onBack}>
          Back to Home
        </button>
      </section>
    )
  }

  return (
    <section className="screen screen-fill workout" data-tint={plan.isFavorites ? 'favorites' : plan.category}>
      <TopBar
        title={plan.title}
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            End
          </button>
        }
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label={starred ? 'Remove favorite' : 'Favorite'}
            aria-pressed={starred}
            onClick={() => onToggleFavorite(shown.id)}
          >
            <StarIcon filled={starred} />
          </button>
        }
      />
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <div className="workout-meta">
        <p>{state.phase === 'rest' ? 'Rest' : `Exercise ${state.slotIndex + 1} of ${plan.slots.length}`}</p>
        <p>Elapsed {formatClock(state.elapsed)}</p>
      </div>
      <ExerciseDemo exercise={shown} playing={state.phase === 'work' && !state.paused} />
      <div className="workout-copy">
        <h2>{state.phase === 'rest' ? 'Rest' : shown.name}</h2>
        <p>{shown.cue}</p>
      </div>
      <p className="countdown" aria-label={`${state.remaining} seconds remaining`}>
        {formatClock(state.remaining)}
        {state.paused && <span>Paused</span>}
      </p>
      <p className="up-next">
        Up next <strong>{upNext}</strong>
      </p>
      <div className="controls">
        <button
          type="button"
          className="control"
          onClick={previous}
          disabled={state.phase === 'work' && state.slotIndex === 0}
        >
          Previous
        </button>
        <button type="button" className="control" onClick={togglePause}>
          {state.paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="control control-accent" onClick={skip}>
          Skip
        </button>
      </div>
    </section>
  )
}
