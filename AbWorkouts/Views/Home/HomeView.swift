import SwiftUI

struct HomeView: View {
    @Environment(SettingsStore.self) private var settingsStore
    @Binding var path: NavigationPath

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                header
                timingChip
                categoryGrid
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 32)
        }
        .background(BrandBackground())
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    path.append(AppRoute.settings)
                } label: {
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(AppTheme.textPrimary)
                        .padding(10)
                        .background(Circle().fill(AppTheme.surfaceStrong))
                }
                .accessibilityLabel("Settings")
            }
        }
        .toolbarBackground(.hidden, for: .navigationBar)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Ab Workouts")
                .font(.system(size: 44, weight: .heavy, design: .rounded))
                .foregroundStyle(AppTheme.textPrimary)
                .minimumScaleFactor(0.8)

            Text("No equipment. Pick a focus and go.")
                .font(.system(.title3, design: .rounded))
                .foregroundStyle(AppTheme.textSecondary)
        }
        .padding(.top, 8)
    }

    private var timingChip: some View {
        let settings = settingsStore.settings
        return HStack(spacing: 8) {
            Image(systemName: "timer")
            Text("\(settings.durationMinutes) min · \(settings.exerciseSeconds)s each")
                .fontWeight(.semibold)
        }
        .font(.system(.subheadline, design: .rounded))
        .foregroundStyle(AppTheme.accent)
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Capsule().fill(AppTheme.accentMuted))
        .accessibilityLabel("Session timing \(settings.durationMinutes) minutes, \(settings.exerciseSeconds) seconds per exercise")
    }

    private var categoryGrid: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(), spacing: 14),
                GridItem(.flexible(), spacing: 14)
            ],
            spacing: 14
        ) {
            ForEach(WorkoutCategory.allCases) { category in
                CategoryTile(category: category) {
                    let plan = WorkoutEngine.makePlan(
                        category: category,
                        settings: settingsStore.settings
                    )
                    path.append(AppRoute.workout(plan))
                }
            }
        }
    }
}
