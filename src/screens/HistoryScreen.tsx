import { useState } from 'react'
import { MinutesChart } from '../components/MinutesChart'
import { TopBar } from '../components/TopBar'
import {
  dailyTotals,
  formatDayLabel,
  formatLoggedMinutes,
  heatLevel,
  heatMonths,
  logsInRange,
  minutesFromSeconds,
  rangeHeadline,
  type WorkoutLog,
} from '../lib/history'

const ranges = [7, 30, 90] as const
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function HistoryScreen({
  logs,
  onDelete,
  onBack,
}: {
  logs: WorkoutLog[]
  onDelete: (id: string) => void
  onBack: () => void
}) {
  const [range, setRange] = useState<(typeof ranges)[number]>(7)
  const [mode, setMode] = useState<'total' | 'focus'>('total')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const today = new Date()
  const days = dailyTotals(logs, range, today)
  const sessions = logsInRange(logs, range, today).filter((log) =>
    selectedDate ? log.localDate === selectedDate : true,
  )
  const max = Math.max(0, ...days.map((day) => day.elapsedSeconds))
  const months = heatMonths(days)

  return (
    <section className="screen screen-scroll">
      <TopBar
        title="History"
        left={
          <button type="button" className="text-btn text-btn-muted" onClick={onBack}>
            Back
          </button>
        }
      />
      <p className="history-total">{rangeHeadline(logs, range, today)}</p>
      <div className="segment" role="group" aria-label="Range">
        {ranges.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={range === option}
            onClick={() => {
              setRange(option)
              setSelectedDate(null)
            }}
          >
            {option === 7 ? '7 days' : option === 30 ? '30 days' : '90 days'}
          </button>
        ))}
      </div>
      {range === 7 ? (
        <>
          <div className="segment" role="group" aria-label="Chart">
            <button type="button" aria-pressed={mode === 'total'} onClick={() => setMode('total')}>
              Total
            </button>
            <button type="button" aria-pressed={mode === 'focus'} onClick={() => setMode('focus')}>
              By focus
            </button>
          </div>
          <MinutesChart days={days} mode={mode} />
        </>
      ) : (
        <div className="heat-months">
          <p className="heat-caption">Each square is a day. A stronger green means more minutes.</p>
          {months.map((month) => (
            <section key={month.key} className="heat-month" aria-label={month.label}>
              <h2 className="heat-month-label">{month.label}</h2>
              <div className="heat">
                {weekdays.map((day) => (
                  <span key={day} className="heat-dow">
                    {day}
                  </span>
                ))}
                {month.cells.map((cell, index) =>
                  cell.date ? (
                    <button
                      key={cell.date}
                      type="button"
                      className={cellClass(cell.isToday, selectedDate === cell.date)}
                      data-level={heatLevel(cell.elapsedSeconds, max)}
                      aria-pressed={selectedDate === cell.date}
                      aria-label={dayLabel(cell.date, cell.elapsedSeconds)}
                      onClick={() => setSelectedDate((current) => (current === cell.date ? null : cell.date))}
                    >
                      {cell.dayOfMonth}
                    </button>
                  ) : (
                    <span key={`blank-${month.key}-${index}`} className="heat-cell heat-blank" />
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      )}
      <div className="settings-block">
        <h2>{selectedDate ? formatDayLabel(selectedDate) : 'Sessions'}</h2>
        {sessions.length === 0 ? (
          <p>{selectedDate ? 'No sessions this day.' : 'No sessions in this range.'}</p>
        ) : (
          <ul className="favorite-list">
            {sessions.map((log) => (
              <li key={log.id}>
                <div>
                  <p className="favorite-name">{log.title}</p>
                  <p className="favorite-meta">
                    {formatDayLabel(log.localDate)} · {formatLoggedMinutes(log.elapsedSeconds)}
                    {log.completed ? '' : ' · Ended early'}
                  </p>
                </div>
                <button type="button" className="text-btn text-btn-muted" onClick={() => onDelete(log.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function cellClass(today: boolean, selected: boolean): string {
  return ['heat-cell', today ? 'heat-today' : '', selected ? 'heat-selected' : ''].filter(Boolean).join(' ')
}

function dayLabel(date: string, elapsedSeconds: number): string {
  const minutes = minutesFromSeconds(elapsedSeconds)
  const amount = elapsedSeconds === 0 ? 'no session' : `${minutes} minutes`
  return `${formatDayLabel(date)}, ${amount}`
}
