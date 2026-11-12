import {
  durationOptions,
  exerciseLengthOptions,
  type WorkoutSettings,
} from '../data/types'
import { TopBar } from '../components/TopBar'

export function SettingsScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: WorkoutSettings
  onChange: (settings: WorkoutSettings) => void
  onBack: () => void
}) {
  return (
    <section className="screen screen-scroll">
      <TopBar
        title="Settings"
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            Back
          </button>
        }
        right={
          <button type="button" className="text-btn" onClick={onBack}>
            Done
          </button>
        }
      />
      <div className="settings-block">
        <h2>Session length</h2>
        <div className="segment" role="group" aria-label="Total duration">
          {durationOptions.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={settings.durationMinutes === minutes}
              onClick={() => onChange({ ...settings, durationMinutes: minutes })}
            >
              {minutes}
            </button>
          ))}
        </div>
        <p>Minutes. Used the next time you start a category, favorites, or saved workout.</p>
      </div>
      <div className="settings-block">
        <h2>Exercise length</h2>
        <div className="segment" role="group" aria-label="Per exercise">
          {exerciseLengthOptions.map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-pressed={settings.exerciseSeconds === seconds}
              onClick={() => onChange({ ...settings, exerciseSeconds: seconds })}
            >
              {seconds}s
            </button>
          ))}
        </div>
        <p>A 3 second rest sits between exercises. No sound or haptics.</p>
      </div>
    </section>
  )
}
