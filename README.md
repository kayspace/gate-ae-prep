# gate ae — prep log

personal site to track gate aerospace eng (2026) prep. clean, local-first, no accounts.

## what's inside

- **syllabus** — general aptitude + 6 ae sections, broken into core / special topics. tick off as you go.
- **books** — folder map for your pdfs.
- **resources** — paste yt videos / playlists / links you're using per subject.
- **formulas** — per-section formula cheatsheet.
- **log** — bird's-eye progress per section.
- **notes** — per-section scratchpad inside the syllabus view.

everything saves to `localStorage` — no accounts, no backend.

## license

mit. see [LICENSE](./LICENSE). do whatever, just keep the notice.

## the stack (intentionally light)

- plain react + tanstack router (template default)
- tailwind for styling, design tokens in `src/styles.css`
- gsap for tiny entrance fades
- no db, no auth, no backend. everything lives in `localStorage`.

## folder layout

```
src/
  lib/syllabus.ts       ← the whole syllabus as data. edit here to tweak.
  routes/index.tsx      ← the app (syllabus / books / log views)
  styles.css            ← design tokens (colors, fonts, lines)
public/
  books/
    math/               ← engineering mathematics pdfs
    flight/             ← flight mechanics pdfs
    space/              ← space dynamics pdfs
    aero/               ← aerodynamics pdfs
    structures/         ← structures pdfs
    propulsion/         ← propulsion pdfs
```

## how to add stuff

**add a pdf** → drop the file into the matching `public/books/<section>/` folder. that's it.

**edit a topic / add a sub-point** → open `src/lib/syllabus.ts`, find the section, edit the `points` array.

**reset progress** → in browser devtools console:
```js
localStorage.removeItem("gate-ae-progress-v1")
localStorage.removeItem("gate-ae-notes-v1")
```

## how to maintain it (suggested rhythm)

- pick one section per week, tick topics off as you finish them
- dump doubts + formula reminders into the per-section notes box
- once a week, hop to the **log** view to see where you're behind
- name pdfs `author-title.pdf` so they sort cleanly
- if you want to add a new resource type (pyqs, videos, mock tests), spin up another top-level view in `src/routes/index.tsx` — same pattern as `books`

## ideas for later

- pyq tracker per year
- mock test scores log
- formula cheatsheet view
- pomodoro / study session counter
