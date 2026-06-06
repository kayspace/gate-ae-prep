# gate ae — developer guide

A lightweight gate aerospace paper prep tracker built as a local-first browser app.

## Overview

This repository contains the prep tracker app used to manage Gate AE study progress.

The app is intentionally simple:

- React-based single-page interface (TanStack Router + TanStack Start)
- no backend services
- browser-only data storage (`localStorage`)
- YouTube playlist **and single-video** support via a user-provided API key
- in-app YouTube player with watched-time tracking and resume (for both playlists and single videos)
- light/dark theme toggle that persists across refresh
- floating back-to-top button for long pages
- desktop-only experience (mobile viewports see a friendly block screen)
- integrated feedback system backed by Notion

## Repo contents

- `README.md` — this developer guide.
- `USER_GUIDE.md` — the user-facing guide intended for first-time visitors.
- `api/feedback.ts` — Vercel serverless function that submits feedback to Notion.
- `src/routes/index.tsx` — thin route shell. Wires app state, persistence, and the active view.
- `src/types/` — shared TypeScript types.
- `src/lib/` — pure utilities (storage, youtube, syllabus helpers, formatting, syllabus + books data).
- `src/data/` — static seed data (recommended resources).
- `src/components/` — reusable UI primitives and layout chrome.
- `src/features/` — one folder per tab/view (`syllabus`, `books`, `resources`, `revise`, `log`, `guide`).
- `src/styles.css` — design tokens and app styling.
- `public/books/` — section-based PDF assets.

## Development

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Useful scripts

- `npm run books` — build PDF metadata from `public/books/`
- `npm run dev` — start the Vite dev server
- `npm run build` — build the app for production
- `npm run preview` — preview production output
- `npm run lint` — lint the codebase
- `npm run format` — format code with Prettier

## Architecture

The app is a single-page React application using TanStack Router for routing and GSAP for entrance
animations. It is intentionally local-first — all state lives in `localStorage`.

The codebase follows **separation of concerns**: the route file owns only top-level state and view
selection; every tab is its own feature module; pure logic (storage, youtube API, syllabus stats)
lives in `src/lib/`.

### High-level flow

1. **User lands on `/`** → `Home` (in `src/routes/index.tsx`) mounts.
2. **Home hydrates state** from `localStorage` via helpers in `src/lib/storage.ts`.
3. **User clicks a nav tab** → `view` state changes (`ViewKey`).
4. **Matching feature view renders** from `src/features/<view>/`.
5. **User input updates state** → `useEffect` persists back to `localStorage`.

### Directory layout

```
api/
└── feedback.ts                # feedback submission endpoint (Notion)
src/
├── routes/
│   ├── __root.tsx              # root layout
│   └── index.tsx               # Home: state, persistence, view switch
├── types/
│   └── index.ts                # Progress, Notes, Resource, Revisions, ViewKey, ...
├── lib/
│   ├── storage.ts              # STORAGE_KEYS, loadJSON, watch-state helpers
│   ├── youtube.ts              # url parsing, Data API fetch, IFrame API loader
│   ├── syllabus.ts             # syllabus data + Section type
│   ├── syllabus-utils.ts       # topicKey, sectionStats
│   ├── books.ts                # auto-generated PDF metadata
│   └── format.ts               # fmtSize, etc.
├── data/
│   └── default-resources.ts    # recommended starter playlists
├── components/
│   ├── ConfirmModal.tsx        # styled confirm dialog
│   ├── EmbeddedPlayer.tsx      # in-app yt player + watch tracking
│   ├── BackToTop.tsx           # floating scroll-to-top button
│   ├── MobileBlock.tsx         # desktop-only overlay for small viewports
│   └── layout/
│       ├── AppHeader.tsx       # title, progress, theme toggle, version
│       ├── AppFooter.tsx
│       └── ViewNav.tsx
└── features/
    ├── syllabus/SyllabusView.tsx
    ├── books/BooksView.tsx
    ├── resources/
    │   ├── ResourcesView.tsx   # container: state + handlers
    │   ├── ResourceItem.tsx    # single resource row + playlist drawer
    │   └── YtApiKeyBox.tsx     # api-key editor
    ├── revise/ReviseView.tsx
    ├── log/LogView.tsx
    └── guide/GuideView.tsx
```

### Why this shape

- `routes/index.tsx` is a thin shell — easy to read end-to-end.
- Each tab is isolated; adding a new tab means a new folder under `features/` + one nav entry.
- Pure helpers in `lib/` are trivially unit-testable and free of React.
- Types live in one place (`src/types`) so they can be imported from anywhere without cycles.

## Data storage

All data is stored in browser `localStorage`. Keys are centralized in `STORAGE_KEYS`
(`src/lib/storage.ts`):

- `gate-ae-progress-v1` — topic completion state
- `gate-ae-notes-v1` — per-section notes
- `gate-ae-resources-v2` — saved videos/playlists/links
- `gate-ae-revise-v1` — per-section revision queue
- `gate-ae-yt-key-v1` — YouTube Data API key
- `gate-ae-watch-v1` — per-video watched seconds, last position, duration (keyed by `resourceId::videoId`)
- `gate-ae-theme-v1` — user-selected theme (`light` / `dark`), falls back to system preference

Use `loadJSON()` for safe parsing with a fallback. Watch-state read/write
goes through `loadWatch()` / `saveWatch()` / `clearWatchFor()`.

No server-side storage or authentication is used.

## Key modules

### `src/routes/index.tsx`

- Owns top-level state (`progress`, `notes`, `resources`, `revisions`, `active`, `view`).
- Hydrates from `localStorage` on mount; persists on every change.
- Renders the active feature view.

### `src/lib/syllabus.ts`

- `Section` type + `syllabus` array. Edit this to change sections/topics.

### `src/lib/syllabus-utils.ts`

- `topicKey(section, topic, point)` — stable progress key.
- `sectionStats(section, progress)` — `{ done, total, pct }`.

### `src/lib/youtube.ts`

- `detectKind(url)` — classifies a URL as `video | playlist | link`.
- `extractPlaylistId(url)` — pulls `list=...` out of a YouTube URL.
- `fetchPlaylistVideos(playlistId, apiKey)` — paged Data API fetch.
- `loadYouTubeAPI()` — singleton loader for the IFrame Player API.

### `src/components/EmbeddedPlayer.tsx`

- In-app YouTube player with anti-skip watched-time tracking (deltas ≤ 2.5s).
- Auto-saves position every ~3s, on pause, tab switch, and unmount.
- Resumes from saved position; auto-marks done at 90% watched.

### `src/components/ConfirmModal.tsx`

- Styled confirmation dialog used wherever a destructive action needs a prompt.

## YouTube integration

1. User provides an API key on the Resources page (`YtApiKeyBox`).
2. Key is stored in `localStorage` under `STORAGE_KEYS.ytKey`.
3. When a YouTube playlist URL is added, `ResourcesView`:
   - extracts the playlist ID via `extractPlaylistId()`
   - fetches videos via `fetchPlaylistVideos()`
   - merges saved `done` flags by `videoId`
4. Each video can be marked done independently or auto-marked at 90% watched.

The embedded player logic lives in `EmbeddedPlayer` and relies on saved watch state to resume playback cleanly.

## Feedback system

The app includes a built-in feedback page that allows users to submit suggestions, bug reports, questions, and general feedback directly from the application.

### Flow

1. User opens the Feedback tab.
2. User enters a nickname, category, and message.
3. Frontend sends a POST request to `/api/feedback`.
4. Vercel executes the serverless function in `api/feedback.ts`.
5. The function creates a new entry in the configured Notion database.
6. The feedback becomes immediately available for review inside Notion.

### Notion integration

The feedback endpoint requires:

- `NOTION_TOKEN` environment variable
- a shared Notion database
- matching database properties:

| Property | Type |
|-----------|--------|
| Nickname | Title |
| Message | Rich Text |
| Category | Select |
| Submitted At | Date |

### Deployment notes

The feedback feature requires deployment on Vercel because it depends on a serverless function.

Local frontend development (`npm run dev`) does not execute Vercel Functions.


## Customization

### Update the syllabus

Edit `src/lib/syllabus.ts`.

### Add books and PDFs

Drop new PDFs into `public/books/<section>/`, then run `npm run books` to regenerate
`src/lib/books.ts`.

### Change default/recommended resources

Edit `src/data/default-resources.ts`.

### Modify styling

Edit `src/styles.css` (design tokens live at the top).

### Add a new tab

1. Add the key to `ViewKey` in `src/types/index.ts`.
2. Add it to the `VIEWS` array in `src/components/layout/ViewNav.tsx`.
3. Create `src/features/<name>/<Name>View.tsx`.
4. Render it from `src/routes/index.tsx`.

## Development workflow

1. Make changes in the relevant feature module or shared lib.
2. Test locally with `npm run dev`.
3. Update `USER_GUIDE.md` if user-facing behavior changes.
4. Commit and push.

## License

MIT. See [LICENSE](./LICENSE).
