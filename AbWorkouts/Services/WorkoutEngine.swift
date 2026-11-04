import Foundation

enum WorkoutEngine {
    static func makePlan(
        category: WorkoutCategory,
        settings: WorkoutSettings
    ) -> WorkoutPlan {
        let pool = ExerciseLibrary.exercises(for: category)
        precondition(!pool.isEmpty, "Category must have exercises")

        var slots: [WorkoutSlot] = []
        slots.reserveCapacity(settings.slotCount)

        for index in 0..<settings.slotCount {
            let exercise = pool[index % pool.count]
            slots.append(
                WorkoutSlot(
                    exercise: exercise,
                    durationSeconds: settings.exerciseSeconds
                )
            )
        }

        return WorkoutPlan(category: category, settings: settings, slots: slots)
    }
}
