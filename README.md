# After Hours: free mystery & horror games

A hub of free, browser-based mystery and horror games. No ads, no accounts; progress saves in the browser.

**Games**
- **The Night Clerk** (playable): a guest vanished from Room 9 of a 1998 roadside motel. Solve it from the front-desk computer.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How it's built

- React + TypeScript + Vite. Hash routing and `base: './'` so the build runs on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
- Each game is its own lazy-loaded bundle, registered in `src/games/registry.ts`. A future Unity WebGL or Three.js game is just a component that mounts its own canvas/iframe.
- Shared pieces live in `src/shared/`: `storage.ts` (namespaced localStorage saves) and `audio/engine.ts` (Howler.js for real files, with procedural Web Audio placeholders until real assets exist).

## The Night Clerk layout

```
src/games/night-clerk/
  data/clues.ts      clues, deductions, chapters, which apps unlock when
  data/records.ts    every in-world document (register, keycard log, emails, voicemails…)
  state.ts           game state, the story "director" (chapter changes, scares), chat scripts, hints
  sound.ts           sound IDs from the design doc (M1–M7, A1–A5, U1–U13, S1–S10)
  render/scenes.ts   placeholder camera stills and cutaways, drawn procedurally on canvas
  ui/                desktop, windows, apps, notebook, accusation, intro/walk/epilogue
```

### Replacing placeholder assets
- **Audio:** add files under `public/audio/night-clerk/` and give the sound an entry like
  `S1: { bus: 'sfx', src: ['audio/night-clerk/S1.ogg', 'audio/night-clerk/S1.mp3'] }` in `sound.ts`.
- **Art:** `CamCanvas` draws scenes from `render/scenes.ts`; swap a scene for an `<img>` when real stills exist.

## Deploy
Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
