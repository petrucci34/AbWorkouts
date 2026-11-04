import Foundation

struct WorkoutSlot: Identifiable, Hashable {
    let id: UUID
    let exercise: Exercise
    let durationSeconds: Int

    init(exercise: Exercise, durationSeconds: Int) {
        self.id = UUID()
        self.exercise = exercise
        self.durationSeconds = durationSeconds
    }
}

struct WorkoutPlan: Identifiable, Hashable {
    let id: UUID
    let category: WorkoutCategory
    let settings: WorkoutSettings
    let slots: [WorkoutSlot]

    init(category: WorkoutCategory, settings: WorkoutSettings, slots: [WorkoutSlot]) {
        self.id = UUID()
        self.category = category
        self.settings = settings
        self.slots = slots
    }

    var totalSeconds: Int {
        slots.reduce(0) { $0 + $1.durationSeconds }
    }
}
