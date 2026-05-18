# gate ae — developer guide

A lightweight gate aerospace paper prep tracker built as a local-first browser app.

## Overview

This repository contains the prep tracker app used to manage Gate AE study progress.

The app is intentionally simple:

- React-based single-page interface
- no backend services
- browser-only data storage
- YouTube playlist support via a user-provided API key

## Repo contents

- `README.md` — this developer guide.
- `USER_GUIDE.md` — the user-facing guide intended for first-time visitors.
- `src/routes/index.tsx` — main app UI and view logic.
- `src/lib/syllabus.ts` — section and topic data.
- `src/lib/books.ts` — default book metadata.
- `src/styles.css` — app styling and design tokens.
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

The app is built as a single-page React application with TanStack Router for routing and GSAP for entrance animations.

### High-level flow

1. **User lands on the app** → Home component loads
2. **Component loads state from localStorage** → progress, notes, resources, formulas, API key
3. **Navigation tab clicked** → view state changes to new ViewKey ("syllabus" | "books" | "resources" | "formulas" | "log" | "guide")
4. **Corresponding view component renders** → user interacts
5. **State updates on user input** → automatically saved to localStorage via useEffect

### App structure

The app is a single large component (`Home`) that manages:

- state for 5 different data types (progress, notes, resources, formulas, books)
- view routing (which tab is active)
- section selection (active AE section)
- shared handlers for updating each data type

Each view (Syllabus, Books, Resources, Formulas, Log, Guide) is a sub-component rendered conditionally inside Home based on the current view.

## Data storage

All data is stored in browser `localStorage` under these keys:

- `gate-ae-progress-v1` — topic completion state (object with topic keys as booleans)
- `gate-ae-notes-v1` — section notes (object with section ID as key, note text as value)
- `gate-ae-resources-v2` — saved videos/playlists/links (nested object: section → array of resources)
- `gate-ae-formulas-v1` — formula notes (object with section ID as key, formula text as value)
- `gate-ae-yt-key-v1` — YouTube Data API key (plain string)

The app uses `loadJSON()` utility to safely parse localStorage with fallback values, and syncs state back on every update via useEffect.

No server-side storage or authentication is used.

## Key modules and functions

### `src/routes/index.tsx`

The main app file containing:

- **Home** — main component, orchestrates all state and view routing
- **SyllabusView** — topic tracking, notes, and section navigation
- **BooksView** — PDF library display
- **ResourcesView** — video/playlist/link manager, YouTube API integration
- **FormulasView** — formula notes editor
- **LogView** — overall progress summary
- **GuideView** — user guide rendered inside the app
- **topicKey()** — generates unique keys for topic tracking
- **detectKind()** — determines if a URL is a video, playlist, or generic link
- **extractPlaylistId()** — extracts YouTube playlist ID from URL
- **fetchPlaylistVideos()** — calls YouTube Data API to load playlist items
- **loadJSON()** — safely parses JSON from localStorage with fallback

### `src/lib/syllabus.ts`

- Defines the `Section` type: contains id, title, number, and arrays of core and special topics
- Exports `syllabus` array — master list of all AE sections and topics
- Edit this file to add/modify sections or topics

### `src/lib/books.ts`

- Defines the `Book` type with metadata (name, file, size)
- Exports `books` array grouped by section ID
- Automatically populated by `npm run books` script from `public/books/`

### `src/styles.css`

- CSS custom properties (design tokens) for colors, fonts, and spacing
- Tailwind configuration
- Animation and utility classes

## View routing

Views are managed via the `view` state variable (type `ViewKey`):

- Tabs in the nav bar trigger `setView()`
- Each view renders conditionally: `{view === "syllabus" && <SyllabusView ... />}`
- Guide tab is available in the footer

## YouTube integration

The app can auto-fetch and display playlist videos via the YouTube Data API:

1. User provides an API key on the Resources page
2. Key is stored in `localStorage` under `gate-ae-yt-key-v1`
3. When a YouTube playlist URL is added, the app:
   - extracts the playlist ID
   - calls `fetchPlaylistVideos()` with the key
   - parses the API response and stores video metadata (ID, title, thumbnail)
4. Each video can be marked as "done" independently
5. Progress is reflected in a progress bar

To support this, the `Resource` type includes optional fields:

- `playlistId` — extracted from URL
- `videos` — array of `PlaylistVideo` objects
- `loading` — fetch state
- `error` — error message if fetch fails

## Customization

### Update the syllabus

Edit `src/lib/syllabus.ts` to change sections, topics, or topic labels.

### Add books and PDFs

Place new PDFs into `public/books/<section>/`.

The `npm run books` script scans these folders and generates metadata.

### Change default resources

Edit the `DEFAULT_RESOURCES` object in `src/routes/index.tsx` to adjust built-in recommended playlists or links.

### Modify styling

Edit `src/styles.css` to update colors, fonts, or add new utility classes.

## State types

All TypeScript types are defined in `src/routes/index.tsx`:

- `Progress` — Record of topic keys → boolean (completed or not)
- `Notes` — Record of section ID → note text
- `Resource` — object with id, title, url, kind, optional playlist metadata
- `Resources` — Record of section ID → array of Resource objects
- `Formulas` — Record of section ID → formula text
- `PlaylistVideo` — video metadata (ID, title, thumbnail, done flag)
- `ViewKey` — union type for active view tab

## User guide integration

The user-facing guide is available inside the app via the **guide** tab (accessed from the footer or nav). The same guide content is maintained in `USER_GUIDE.md`.

## Development workflow

1. Make changes to component logic in `src/routes/index.tsx` or data in `src/lib/syllabus.ts`
2. Test locally with `npm run dev`
3. Update `USER_GUIDE.md` if user-facing behavior changes
4. Commit and push

## License

MIT. See [LICENSE](./LICENSE).
