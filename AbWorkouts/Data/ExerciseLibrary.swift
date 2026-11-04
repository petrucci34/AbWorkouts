import Foundation

enum ExerciseLibrary {
    static let all: [Exercise] = [
        Exercise(
            id: "crunch",
            name: "Crunch",
            categories: [.upper],
            cue: "Ribs toward hips. Keep low back lightly pressed down.",
            placeholderKind: .crunch
        ),
        Exercise(
            id: "sit-up",
            name: "Sit-up",
            categories: [.upper],
            cue: "Full range — shoulders leave the floor, then lower with control.",
            placeholderKind: .sitUp
        ),
        Exercise(
            id: "toe-touch",
            name: "Toe touch",
            categories: [.upper],
            cue: "Reach toward toes with legs up or bent. Don’t yank the neck.",
            placeholderKind: .toeTouch
        ),
        Exercise(
            id: "reverse-crunch",
            name: "Reverse crunch",
            categories: [.upper, .lower],
            cue: "Curl hips toward chest. Avoid swinging with momentum.",
            placeholderKind: .reverseCrunch
        ),
        Exercise(
            id: "lying-leg-raise",
            name: "Lying leg raise",
            categories: [.lower],
            cue: "Lower legs slowly. Press low back into the floor.",
            placeholderKind: .legRaise
        ),
        Exercise(
            id: "flutter-kicks",
            name: "Flutter kicks",
            categories: [.lower],
            cue: "Small alternating kicks. Keep ribs down and neck long.",
            placeholderKind: .flutter
        ),
        Exercise(
            id: "scissor-kicks",
            name: "Scissor kicks",
            categories: [.lower],
            cue: "Cross legs alternately. Steady tempo, soft knees.",
            placeholderKind: .scissor
        ),
        Exercise(
            id: "dead-bug",
            name: "Dead bug",
            categories: [.lower, .fullCore],
            cue: "Opposite arm and leg reach long. Keep lower back glued down.",
            placeholderKind: .deadBug
        ),
        Exercise(
            id: "bicycle-crunch",
            name: "Bicycle crunch",
            categories: [.obliques],
            cue: "Elbow to opposite knee. Rotate through the ribs, not the neck.",
            placeholderKind: .bicycle
        ),
        Exercise(
            id: "russian-twist",
            name: "Russian twist",
            categories: [.obliques],
            cue: "Lean back slightly. Rotate side to side with a long spine.",
            placeholderKind: .russianTwist
        ),
        Exercise(
            id: "heel-taps",
            name: "Heel taps",
            categories: [.obliques],
            cue: "Crunch up lightly and tap each heel in turn.",
            placeholderKind: .heelTap
        ),
        Exercise(
            id: "side-plank",
            name: "Side plank",
            categories: [.obliques],
            cue: "Stack hips. Hold steady or dip and lift with control.",
            placeholderKind: .sidePlank
        ),
        Exercise(
            id: "forearm-plank",
            name: "Forearm plank",
            categories: [.fullCore],
            cue: "Ribs in, glutes lightly on. Don’t let hips sag or pike.",
            placeholderKind: .plank
        ),
        Exercise(
            id: "mountain-climber",
            name: "Mountain climber",
            categories: [.fullCore],
            cue: "Drive knees under the chest. Keep shoulders over wrists.",
            placeholderKind: .mountainClimber
        ),
        Exercise(
            id: "hollow-body-hold",
            name: "Hollow body hold",
            categories: [.fullCore],
            cue: "Press low back down. Arms and legs long, ribs tucked.",
            placeholderKind: .hollowHold
        )
    ]

    static func exercises(for category: WorkoutCategory) -> [Exercise] {
        all.filter { $0.categories.contains(category) }
    }
}
