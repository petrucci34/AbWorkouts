import SwiftUI

enum WorkoutCategory: String, CaseIterable, Identifiable, Codable, Hashable {
    case upper
    case lower
    case obliques
    case fullCore

    var id: String { rawValue }

    var title: String {
        switch self {
        case .upper: return "Upper"
        case .lower: return "Lower"
        case .obliques: return "Obliques"
        case .fullCore: return "Full core"
        }
    }

    var subtitle: String {
        switch self {
        case .upper: return "Crunches & sit-ups"
        case .lower: return "Legs & lower abs"
        case .obliques: return "Twists & sides"
        case .fullCore: return "Planks & holds"
        }
    }

    var symbolName: String {
        switch self {
        case .upper: return "arrow.up.circle.fill"
        case .lower: return "arrow.down.circle.fill"
        case .obliques: return "arrow.triangle.2.circlepath"
        case .fullCore: return "circle.hexagongrid.fill"
        }
    }

    var tint: Color {
        switch self {
        case .upper: return Color(red: 0.55, green: 0.92, blue: 1.0)
        case .lower: return Color(red: 0.98, green: 0.78, blue: 0.42)
        case .obliques: return Color(red: 1.0, green: 0.55, blue: 0.48)
        case .fullCore: return AppTheme.accent
        }
    }
}
