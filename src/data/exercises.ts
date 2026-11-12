import { catalog } from './catalog'
import type { Category, Exercise } from './types'

export const exercises: Exercise[] = catalog.map(({ id, name, categories, cue }) => ({
  id,
  name,
  categories,
  cue,
}))

export function exercisesFor(category: Category): Exercise[] {
  return exercises.filter((exercise) => exercise.categories.includes(category))
}

export function exerciseById(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id)
}
