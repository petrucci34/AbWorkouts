import type { Category, Exercise } from './types'

function move(id: string, name: string, categories: Category[], cue: string): Exercise {
  return { id, name, categories, cue }
}

export const exercises: Exercise[] = [
  move('crunch', 'Crunch', ['upper'], 'Ribs toward hips. Keep the low back lightly pressed down.'),
  move('sit-up', 'Sit-up', ['upper'], 'Full range. Shoulders leave the floor, then lower with control.'),
  move('toe-touch', 'Toe touch', ['upper'], 'Hinge at the hips and reach toward the toes. Keep the knees soft.'),
  move(
    'lying-crunch-straight-legs',
    'Lying crunch',
    ['upper'],
    'Legs long and low. Curl the ribs toward the hips.',
  ),
  move(
    'reverse-crunch',
    'Reverse crunch',
    ['upper', 'lower'],
    'Curl the hips toward the chest. Avoid swinging with momentum.',
  ),
  move('lying-leg-raise', 'Lying leg raise', ['lower'], 'Lower the legs slowly. Press the low back into the floor.'),
  move('flutter-kicks', 'Flutter kicks', ['lower'], 'Small alternating kicks. Keep the ribs down and the neck long.'),
  move('scissor-kicks', 'Scissor kicks', ['lower'], 'Cross the legs alternately. Steady tempo, soft knees.'),
  move(
    'dead-bug',
    'Dead bug',
    ['lower', 'fullCore'],
    'Opposite arm and leg reach long. Keep the lower back glued down.',
  ),
  move(
    'bicycle-crunch',
    'Bicycle crunch',
    ['obliques'],
    'Elbow toward the opposite knee. Rotate through the ribs, not the neck.',
  ),
  move('russian-twist', 'Russian twist', ['obliques'], 'Lean back slightly. Rotate side to side with a long spine.'),
  move('heel-taps', 'Heel taps', ['obliques'], 'Crunch up lightly and tap each heel in turn.'),
  move('oblique-crunch', 'Oblique crunch', ['obliques'], 'Side-lying crunch. Lift the lower shoulder toward the hip.'),
  move('side-plank', 'Side plank', ['obliques'], 'Stack the hips. Hold steady, or dip and lift with control.'),
  move(
    'windshield-wipers',
    'Windshield wipers',
    ['obliques', 'lower'],
    'Legs up together. Rotate them side to side. Shoulders stay down.',
  ),
  move('forearm-plank', 'Forearm plank', ['fullCore'], 'Ribs in, glutes lightly on. Don\'t let the hips sag or pike.'),
  move(
    'plank-shoulder-taps',
    'Plank shoulder taps',
    ['fullCore'],
    'High plank. Tap each shoulder without rocking the hips.',
  ),
  move(
    'plank-hip-dips',
    'Plank hip dips',
    ['obliques', 'fullCore'],
    'Forearm plank. Drop one hip toward the floor, then the other.',
  ),
  move(
    'mountain-climber',
    'Mountain climber',
    ['fullCore'],
    'Drive the knees under the chest. Keep the shoulders over the wrists.',
  ),
  move(
    'hollow-body-hold',
    'Hollow body hold',
    ['fullCore'],
    'Press the low back down. Arms and legs long, ribs tucked.',
  ),
  move('bird-dog', 'Bird dog', ['fullCore'], 'Reach the opposite arm and leg. Keep the hips square.'),
  move(
    'jackknife-v-up',
    'Jackknife',
    ['upper', 'fullCore'],
    'Fold at the hips and reach toward the feet. Lower with control.',
  ),
  move('v-sit-hold', 'V-sit hold', ['upper', 'fullCore'], 'Balance on the sit bones. Chest tall, legs lifted.'),
  move('bear-crawl', 'Bear crawl', ['fullCore'], 'Knees hover under the hips. Step the opposite hand and foot.'),
  move('superman', 'Superman', ['fullCore'], 'Lift the chest and legs together. Long spine, glutes on.'),
  move(
    'push-up-to-side-plank',
    'Push-up to side plank',
    ['obliques', 'fullCore'],
    'Push up, open to a side plank, then switch sides.',
  ),
  move('inchworm', 'Inchworm', ['fullCore'], 'Walk the hands out to a plank, then the feet toward the hands.'),
  move(
    'floor-l-sit',
    'Floor L-sit',
    ['lower', 'fullCore'],
    'Press the floor away. Legs stay long and lifted in front.',
  ),
]

export function exercisesFor(category: Category): Exercise[] {
  return exercises.filter((exercise) => exercise.categories.includes(category))
}

export function exerciseById(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id)
}
