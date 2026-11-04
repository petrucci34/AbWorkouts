import SwiftUI

enum AppTheme {
    static let backgroundTop = Color(red: 0.05, green: 0.11, blue: 0.10)
    static let backgroundBottom = Color(red: 0.08, green: 0.16, blue: 0.14)
    static let surface = Color.white.opacity(0.08)
    static let surfaceStrong = Color.white.opacity(0.14)
    static let accent = Color(red: 0.49, green: 0.98, blue: 0.70)
    static let accentMuted = Color(red: 0.49, green: 0.98, blue: 0.70).opacity(0.22)
    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.72)
    static let textTertiary = Color.white.opacity(0.45)
    static let danger = Color(red: 1.0, green: 0.42, blue: 0.38)

    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [backgroundTop, backgroundBottom],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct BrandBackground: View {
    var body: some View {
        ZStack {
            AppTheme.backgroundGradient
            RadialGradient(
                colors: [AppTheme.accent.opacity(0.18), .clear],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 420
            )
            RadialGradient(
                colors: [Color.black.opacity(0.35), .clear],
                center: .bottomLeading,
                startRadius: 40,
                endRadius: 380
            )
        }
        .ignoresSafeArea()
    }
}
