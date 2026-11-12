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

Exercise clips live in `public/exercises/`. `src/data/catalog.ts` is the list of moves: name, cue, categories, and the GIF stem.

## Done

- [x] One catalog file for moves and clips. Add a move with one entry plus its GIF. Remove a move by deleting the entry.
- [x] Category sessions (Upper, Lower, Obliques, Full core), a favorites list, and a custom workout builder. Saved workouts are tiles on Home.
- [x] Settings for `5 / 8 / 10 / 15 / 20` minutes and `30s / 60s` per exercise. A 3 second rest sits between moves. No sound and no vibration.
- [x] Workout screen with a looping GIF, countdown, up next, pause, skip, previous, and a favorite star. Elapsed time is the wall clock from the start of the session to the end, and it keeps running through pause, skip, and back.
- [x] Session log on this device. A finished session is saved. Ending before 30 seconds is not. The log keeps the latest 400 sessions.
- [x] Home shows the last 7 days. Tap it to open History.
- [x] History: 7-day bars for the total and by focus, a 30-day and 90-day calendar, the range total, a streak, and a session list. A session can be removed. Minutes on a saved session are not editable.
- [x] The session-done screen shows this week’s minutes.
- [x] Settings can export and import a JSON backup of sessions, favorites, and saved workouts.

## Still to do

- [ ] Record a Favorites session as its own focus. It is stored under the first move’s category, so the chart cannot show it separately.
