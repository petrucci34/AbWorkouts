# Ab Workouts

Native SwiftUI iPhone + iPad app for no-equipment ab sessions.

## Open in Xcode

1. Copy or clone this folder onto a Mac.
2. Open `AbWorkouts.xcodeproj`.
3. Select an iPhone/iPad simulator or device.
4. Set your Development Team under Signing if needed.
5. Run (⌘R).

Requires **Xcode 15+** / **iOS 17+**.

## What’s in v1

- **Home** — brand header + four category tiles (Upper, Lower, Obliques, Full core). Tap starts a session immediately with the last Settings timing.
- **Settings** — total duration `5 / 8 / 10 / 15 / 20` min and per-exercise `30s / 60s` only. Persisted.
- **Workout** — cycles the category’s exercises for the session length; pause / skip / end; completion screen.
- **Media** — animated stick-figure **placeholders** (no GymVisual or scraped GIFs). Swap later via `ExercisePlaceholderView` / asset pipeline.
- **Audio** — none (no sound or haptics).

## Exercise library

Fifteen bodyweight moves in `Data/ExerciseLibrary.swift`, mapped to categories from the media-sourcing shortlist.

## Tests

`AbWorkoutsTests` covers workout plan slot counts and category coverage. Run with ⌘U in Xcode.
