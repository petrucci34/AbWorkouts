import Foundation

struct Exercise: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let categories: [WorkoutCategory]
    let cue: String
    let placeholderKind: PlaceholderKind

    enum PlaceholderKind: String, Codable, Hashable {
        case crunch
        case sitUp
        case toeTouch
        case reverseCrunch
        case legRaise
        case flutter
        case scissor
        case deadBug
        case bicycle
        case russianTwist
        case heelTap
        case sidePlank
        case plank
        case mountainClimber
        case hollowHold
    }
}
