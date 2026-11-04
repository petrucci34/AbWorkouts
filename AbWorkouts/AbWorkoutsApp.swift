import SwiftUI

@main
struct AbWorkoutsApp: App {
    @State private var settingsStore = SettingsStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(settingsStore)
        }
    }
}
