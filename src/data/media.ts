import { catalog } from './catalog'

const gifById = new Map(
  catalog.flatMap((entry) => (entry.gif ? [[entry.id, entry.gif] as const] : [])),
)

export function hasGif(exerciseId: string): boolean {
  return gifById.has(exerciseId)
}

export function assetUrl(file: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${file.replace(/^\//, '')}`
}

export function gifUrl(exerciseId: string): string | null {
  const stem = gifById.get(exerciseId)
  return stem ? assetUrl(`exercises/${stem}.gif`) : null
}
