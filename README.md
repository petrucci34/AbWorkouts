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

- **Home** — four category tiles (Upper, Lower, Obliques, Full core). A tap starts a session with the last Settings timing.
- **Settings** — total duration `5 / 8 / 10 / 15 / 20` min and per-exercise `30s / 60s` only. No category picker.
- **Workout** — moves for that category fill the session. Looping GIF, interval countdown, elapsed time, up next, skip, pause, and a favorite star. A fixed 3 second rest sits between moves.
- **Favorites** — exercises you star, with a way to start a session from that list.
- **Audio** — none. No sound and no vibration.

Exercise clips are the purchased GIFs from `ab-core-gifs`, renamed to exercise ids in `public/exercises/`. Scissor kicks has no clip, so that move shows a short fallback.
