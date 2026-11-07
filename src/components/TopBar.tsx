import type { ReactNode } from 'react'

export function TopBar({
  title,
  left,
  right,
}: {
  title?: string
  left?: ReactNode
  right?: ReactNode
}) {
  return (
    <header className="topbar">
      <div className="topbar-side">{left}</div>
      {title ? <h1 className="topbar-title">{title}</h1> : <div />}
      <div className="topbar-side topbar-side-end">{right}</div>
    </header>
  )
}
