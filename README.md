# Ab Workouts

React app for no-equipment ab sessions. Open it in the browser on an iPhone or iPad. The layout is the same on both; the iPad version is just larger.

## Run

```bash
npm install
npm test
npm run dev
```

Then open the local URL Vite prints. `npm run build` writes a static site to `dist/`.

The live site is [petrucci34.github.io/AbWorkouts](https://petrucci34.github.io/AbWorkouts/). Pushes to this branch publish it through GitHub Pages.

## What’s included

- **Home** — four category tiles (Upper, Lower, Obliques, Full core). A tap starts a session with the last Settings timing. Home also opens the workout builder and saved workouts.
- **Settings** — total duration `5 / 8 / 10 / 15 / 20` min and per-exercise `30s / 60s` only. No category picker.
- **Workout** — moves for that category fill the session. Looping GIF, interval countdown, elapsed time, up next, previous, skip, pause, end, and a favorite star. A fixed 3 second rest sits between moves.
- **Custom workouts** — pick exercises, order them, name the workout, and save it on this device. Starting one uses the current Settings timing and the 3 second rest. A list shorter than the session repeats to fill the time. A longer list plays once.
- **Favorites** — exercises you star, with a way to start a session from that list. A saved favorite whose exercise was removed is dropped on the next load.
- **Audio** — none. No sound and no vibration.

Exercise clips are the purchased GIFs from `ab-core-gifs`, renamed to exercise ids in `public/exercises/`. Scissor kicks has no clip, so that move shows a short fallback.
