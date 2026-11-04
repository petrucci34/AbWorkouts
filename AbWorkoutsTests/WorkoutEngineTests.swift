import XCTest
@testable import AbWorkouts

final class WorkoutEngineTests: XCTestCase {
    func testPlanUsesSettingsSlotCount() {
        let settings = WorkoutSettings(durationMinutes: 10, exerciseSeconds: 30)
        let plan = WorkoutEngine.makePlan(category: .upper, settings: settings)
        XCTAssertEqual(plan.slots.count, 20)
        XCTAssertEqual(plan.totalSeconds, 600)
        XCTAssertTrue(plan.slots.allSatisfy { $0.durationSeconds == 30 })
    }

    func testPlanCyclesCategoryExercises() {
        let settings = WorkoutSettings(durationMinutes: 5, exerciseSeconds: 60)
        let plan = WorkoutEngine.makePlan(category: .fullCore, settings: settings)
        let pool = ExerciseLibrary.exercises(for: .fullCore)
        XCTAssertEqual(plan.slots.count, 5)
        for (index, slot) in plan.slots.enumerated() {
            XCTAssertEqual(slot.exercise.id, pool[index % pool.count].id)
        }
    }

    func testEveryCategoryHasExercises() {
        for category in WorkoutCategory.allCases {
            XCTAssertFalse(ExerciseLibrary.exercises(for: category).isEmpty)
        }
    }
}
