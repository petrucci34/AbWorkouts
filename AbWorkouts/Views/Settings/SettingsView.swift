import SwiftUI

struct SettingsView: View {
    @Environment(SettingsStore.self) private var settingsStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        @Bindable var settingsStore = settingsStore

        List {
            Section {
                Picker("Total duration", selection: $settingsStore.durationMinutes) {
                    ForEach(WorkoutSettings.durationOptions, id: \.self) { minutes in
                        Text("\(minutes) min").tag(minutes)
                    }
                }
                .pickerStyle(.segmented)
                .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16))
            } header: {
                Text("Session length")
            } footer: {
                Text("Used the next time you tap a category on Home.")
            }

            Section {
                Picker("Per exercise", selection: $settingsStore.exerciseSeconds) {
                    ForEach(WorkoutSettings.exerciseLengthOptions, id: \.self) { seconds in
                        Text("\(seconds)s").tag(seconds)
                    }
                }
                .pickerStyle(.segmented)
                .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16))
            } header: {
                Text("Exercise length")
            } footer: {
                Text("No sound or haptics — watch the timer on screen.")
            }
        }
        .scrollContentBackground(.hidden)
        .background(BrandBackground())
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Done") { dismiss() }
                    .fontWeight(.semibold)
                    .foregroundStyle(AppTheme.accent)
            }
        }
        .toolbarBackground(.hidden, for: .navigationBar)
    }
}
