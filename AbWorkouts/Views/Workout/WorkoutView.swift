import SwiftUI

struct WorkoutView: View {
    let plan: WorkoutPlan

    @Environment(\.dismiss) private var dismiss
    @State private var slotIndex = 0
    @State private var secondsRemaining = 0
    @State private var isPaused = false
    @State private var isComplete = false
    @State private var elapsedTotal = 0

    private let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var currentSlot: WorkoutSlot? {
        guard plan.slots.indices.contains(slotIndex) else { return nil }
        return plan.slots[slotIndex]
    }

    var body: some View {
        Group {
            if isComplete {
                WorkoutCompleteView(
                    category: plan.category,
                    totalSeconds: elapsedTotal,
                    onDone: { dismiss() }
                )
            } else if let slot = currentSlot {
                activeContent(slot: slot)
            } else {
                Color.clear.onAppear { isComplete = true }
            }
        }
        .background(BrandBackground())
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("End") { dismiss() }
                    .foregroundStyle(AppTheme.textSecondary)
            }
            ToolbarItem(placement: .principal) {
                Text(plan.category.title)
                    .font(.system(.headline, design: .rounded).weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary)
            }
        }
        .toolbarBackground(.hidden, for: .navigationBar)
        .onAppear { resetCurrentSlot() }
        .onReceive(tick) { _ in
            guard !isPaused, !isComplete else { return }
            tickClock()
        }
    }

    private func activeContent(slot: WorkoutSlot) -> some View {
        VStack(spacing: 20) {
            progressHeader

            ExercisePlaceholderView(
                kind: slot.exercise.placeholderKind,
                tint: plan.category.tint
            )
            .frame(maxHeight: 320)
            .padding(.horizontal, 20)

            VStack(spacing: 8) {
                Text(slot.exercise.name)
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(AppTheme.textPrimary)
                    .multilineTextAlignment(.center)

                Text(slot.exercise.cue)
                    .font(.system(.body, design: .rounded))
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }

            Text(timeString(secondsRemaining))
                .font(.system(size: 64, weight: .heavy, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(AppTheme.accent)
                .contentTransition(.numericText())
                .animation(.snappy, value: secondsRemaining)

            Spacer(minLength: 0)

            controls
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
        }
        .padding(.top, 8)
    }

    private var progressHeader: some View {
        let duration = max(currentSlot?.durationSeconds ?? 1, 1)
        let slotProgress = 1 - (Double(secondsRemaining) / Double(duration))
        let overall = plan.slots.isEmpty
            ? 0
            : (Double(slotIndex) + slotProgress) / Double(plan.slots.count)

        return VStack(spacing: 10) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(AppTheme.surfaceStrong)
                    Capsule()
                        .fill(plan.category.tint)
                        .frame(width: max(8, geo.size.width * min(max(overall, 0), 1)))
                }
            }
            .frame(height: 8)
            .padding(.horizontal, 20)

            Text("Exercise \(slotIndex + 1) of \(plan.slots.count)")
                .font(.system(.footnote, design: .rounded).weight(.medium))
                .foregroundStyle(AppTheme.textTertiary)
        }
    }

    private var controls: some View {
        HStack(spacing: 12) {
            Button {
                isPaused.toggle()
            } label: {
                Label(isPaused ? "Resume" : "Pause", systemImage: isPaused ? "play.fill" : "pause.fill")
                    .font(.system(.headline, design: .rounded))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(AppTheme.surfaceStrong))
            }
            .buttonStyle(.plain)
            .foregroundStyle(AppTheme.textPrimary)

            Button {
                advance()
            } label: {
                Label("Skip", systemImage: "forward.fill")
                    .font(.system(.headline, design: .rounded))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(AppTheme.accentMuted))
            }
            .buttonStyle(.plain)
            .foregroundStyle(AppTheme.accent)
        }
    }

    private func resetCurrentSlot() {
        secondsRemaining = currentSlot?.durationSeconds ?? 0
        isPaused = false
    }

    private func tickClock() {
        guard secondsRemaining > 0 else {
            advance()
            return
        }
        secondsRemaining -= 1
        elapsedTotal += 1
        if secondsRemaining == 0 {
            advance()
        }
    }

    private func advance() {
        if slotIndex + 1 < plan.slots.count {
            slotIndex += 1
            resetCurrentSlot()
        } else {
            isComplete = true
        }
    }

    private func timeString(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%d:%02d", m, s)
    }
}
