/**
 * Purchased files from ab-core-gifs, renamed to exercise ids.
 * front-plank and hollow-hold are the same moves as the existing ids.
 * lying-toe-touch did not match `toe-touch`, so it is its own exercise.
 */
export const purchaseStemToExerciseId: Record<string, string> = {
  crunch: 'crunch',
  'sit-up': 'sit-up',
  'reverse-crunch': 'reverse-crunch',
  'lying-leg-raise': 'lying-leg-raise',
  'flutter-kicks': 'flutter-kicks',
  'dead-bug': 'dead-bug',
  'bicycle-crunch': 'bicycle-crunch',
  'russian-twist': 'russian-twist',
  'heel-taps': 'heel-taps',
  'side-plank': 'side-plank',
  'front-plank': 'forearm-plank',
  'mountain-climber': 'mountain-climber',
  'hollow-hold': 'hollow-body-hold',
  'oblique-crunch': 'oblique-crunch',
  'lying-crunch-straight-legs': 'lying-crunch-straight-legs',
  'bird-dog': 'bird-dog',
  'plank-shoulder-taps': 'plank-shoulder-taps',
  'jackknife-v-up': 'jackknife-v-up',
  'lying-toe-touch': 'lying-toe-touch',
  'windshield-wipers': 'windshield-wipers',
  'v-sit-hold': 'v-sit-hold',
  'bear-crawl': 'bear-crawl',
  superman: 'superman',
  'plank-hip-dips': 'plank-hip-dips',
  'push-up-to-side-plank': 'push-up-to-side-plank',
  inchworm: 'inchworm',
  'floor-l-sit': 'floor-l-sit',
}

const wiredIds = new Set(Object.values(purchaseStemToExerciseId))

export function hasGif(exerciseId: string): boolean {
  return wiredIds.has(exerciseId)
}

export function gifUrl(exerciseId: string): string | null {
  return hasGif(exerciseId) ? `/exercises/${exerciseId}.gif` : null
}
