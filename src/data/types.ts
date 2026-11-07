export type Category = 'upper' | 'lower' | 'obliques' | 'fullCore'

export interface Exercise {
  id: string
  name: string
  categories: Category[]
  cue: string
}

export interface WorkoutSettings {
  durationMinutes: number
  exerciseSeconds: number
}

export const durationOptions = [5, 8, 10, 15, 20] as const
export const exerciseLengthOptions = [30, 60] as const

export const categories: Category[] = ['upper', 'lower', 'obliques', 'fullCore']

export const categoryInfo: Record<Category, { title: string; subtitle: string }> = {
  upper: { title: 'Upper', subtitle: 'Crunches & sit-ups' },
  lower: { title: 'Lower', subtitle: 'Legs & lower abs' },
  obliques: { title: 'Obliques', subtitle: 'Twists & sides' },
  fullCore: { title: 'Full core', subtitle: 'Planks & holds' },
}
