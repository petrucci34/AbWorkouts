import { categories, categoryInfo } from '../data/types'
import { minutesFromSeconds, type DayTotal } from '../lib/history'

const trackHeight = 112

export function MinutesChart({
  days,
  mode,
  compact = false,
}: {
  days: DayTotal[]
  mode: 'total' | 'focus'
  compact?: boolean
}) {
  const max = Math.max(1, ...days.map((day) => day.elapsedSeconds))
  const height = compact ? 48 : trackHeight
  const summary = days
    .map((day) => `${day.weekday} ${minutesFromSeconds(day.elapsedSeconds)} minutes`)
    .join(', ')

  return (
    <div className={compact ? 'bars bars-compact' : 'bars'}>
      <div
        className="bar-plot"
        role={compact ? undefined : 'img'}
        aria-label={compact ? undefined : summary}
        aria-hidden={compact ? true : undefined}
      >
        {days.map((day) => (
          <div key={day.date} className="bar-col">
            {compact ? null : <span className="bar-value">{minutesFromSeconds(day.elapsedSeconds)}</span>}
            <span className="bar-stack" style={{ height }}>
              {mode === 'total' ? (
                <span
                  className={segmentClass(day.elapsedSeconds > 0, day.isToday, 'bar-total')}
                  style={{ height: segmentHeight(day.elapsedSeconds, max, height) }}
                />
              ) : day.elapsedSeconds === 0 ? (
                <span className="bar-seg bar-rest" style={{ height: 3 }} />
              ) : (
                categories.map((category) =>
                  day.byCategory[category] > 0 ? (
                    <span
                      key={category}
                      className={segmentClass(true, day.isToday)}
                      data-category={category}
                      style={{ height: segmentHeight(day.byCategory[category], max, height) }}
                    />
                  ) : null,
                )
              )}
            </span>
            <span className={day.isToday ? 'bar-day bar-day-today' : 'bar-day'}>{day.weekday}</span>
          </div>
        ))}
      </div>
      {mode === 'focus' && !compact ? <FocusLegend /> : null}
    </div>
  )
}

function FocusLegend() {
  return (
    <ul className="focus-legend">
      {categories.map((category) => (
        <li key={category}>
          <i data-category={category} />
          {categoryInfo[category].title}
        </li>
      ))}
    </ul>
  )
}

function segmentClass(filled: boolean, today: boolean, tone?: string): string {
  const todayClass = filled && today ? ' bar-today' : ''
  if (!filled) return 'bar-seg bar-rest'
  return tone ? `bar-seg ${tone}${todayClass}` : `bar-seg${todayClass}`
}

function segmentHeight(seconds: number, max: number, height: number): number {
  if (seconds <= 0) return 3
  return Math.max(4, Math.round((seconds / max) * height))
}
