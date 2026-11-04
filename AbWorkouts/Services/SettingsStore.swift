import Foundation
import Observation

@Observable
final class SettingsStore {
    private let defaults: UserDefaults
    private let durationKey = "settings.durationMinutes"
    private let exerciseKey = "settings.exerciseSeconds"

    var durationMinutes: Int {
        didSet { defaults.set(durationMinutes, forKey: durationKey) }
    }

    var exerciseSeconds: Int {
        didSet { defaults.set(exerciseSeconds, forKey: exerciseKey) }
    }

    var settings: WorkoutSettings {
        WorkoutSettings(durationMinutes: durationMinutes, exerciseSeconds: exerciseSeconds)
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let duration = defaults.object(forKey: durationKey) as? Int
            ?? WorkoutSettings.default.durationMinutes
        let exercise = defaults.object(forKey: exerciseKey) as? Int
            ?? WorkoutSettings.default.exerciseSeconds
        self.durationMinutes = WorkoutSettings.durationOptions.contains(duration)
            ? duration
            : WorkoutSettings.default.durationMinutes
        self.exerciseSeconds = WorkoutSettings.exerciseLengthOptions.contains(exercise)
            ? exercise
            : WorkoutSettings.default.exerciseSeconds
    }
}
