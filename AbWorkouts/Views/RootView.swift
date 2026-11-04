import SwiftUI

enum AppRoute: Hashable {
    case settings
    case workout(WorkoutPlan)
}

struct RootView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .settings:
                        SettingsView()
                    case .workout(let plan):
                        WorkoutView(plan: plan)
                    }
                }
        }
        .tint(AppTheme.accent)
        .preferredColorScheme(.dark)
    }
}
