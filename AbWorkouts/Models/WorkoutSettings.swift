import Foundation

struct WorkoutSettings: Equatable, Codable {
    var durationMinutes: Int
    var exerciseSeconds: Int

    static let durationOptions = [5, 8, 10, 15, 20]
    static let exerciseLengthOptions = [30, 60]

    static let `default` = WorkoutSettings(durationMinutes: 10, exerciseSeconds: 30)

    var totalSeconds: Int { durationMinutes * 60 }

    var slotCount: Int {
        max(1, totalSeconds / max(exerciseSeconds, 1))
    }
}
