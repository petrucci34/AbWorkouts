import { useRef, useState } from 'react'
import {
  durationOptions,
  exerciseLengthOptions,
  type WorkoutSettings,
} from '../data/types'
import { parseBackup, type BackupFile } from '../lib/backup'
import { TopBar } from '../components/TopBar'

export function SettingsScreen({
  settings,
  onChange,
  onBack,
  onExport,
  onImport,
}: {
  settings: WorkoutSettings
  onChange: (settings: WorkoutSettings) => void
  onBack: () => void
  onExport: () => void
  onImport: (file: BackupFile) => void
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
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
      <div className="settings-block">
        <h2>Backup</h2>
        <p>Export a file to move sessions, favorites, and saved workouts to another device. Import merges that file into this one.</p>
        <div className="backup-actions">
          <button type="button" className="backup-btn" onClick={onExport}>
            Export
          </button>
          <button type="button" className="backup-btn" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Backup file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              void file.text().then((text) => {
                const parsed = parseBackup(text)
                if (!parsed) {
                  setNotice("That file isn't a backup.")
                  return
                }
                onImport(parsed)
                setNotice('Backup imported.')
              }).catch(() => {
                setNotice("That file isn't a backup.")
              })
            }}
          />
        </div>
        {notice ? <p role="status">{notice}</p> : null}
      </div>
    </section>
  )
}
