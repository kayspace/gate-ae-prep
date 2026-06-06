# Contributing to gate-ae-prep-tracker

Thank you for taking the time to contribute. This project is a local-first GATE Aerospace Engineering prep tracker built with React, TanStack Router, and browser `localStorage`. Every contribution — whether it is a bug report, a documentation fix, or a new feature — makes the tool better for every student using it.

This guide explains everything you need to know to contribute effectively. Read it fully before opening an issue or submitting a pull request.

---

## Table of Contents

1. [Before You Contribute](#before-you-contribute)
2. [Ways to Contribute](#ways-to-contribute)
3. [Project Overview for Contributors](#project-overview-for-contributors)
4. [Setting Up Your Development Environment](#setting-up-your-development-environment)
5. [Development Workflow](#development-workflow)
6. [Branch Naming Conventions](#branch-naming-conventions)
7. [Commit Message Conventions](#commit-message-conventions)
8. [Code Style Guidelines](#code-style-guidelines)
9. [Testing Your Changes](#testing-your-changes)
10. [Pull Request Guidelines](#pull-request-guidelines)
11. [Pull Request Template](#pull-request-template)
12. [After Your PR is Merged](#after-your-pr-is-merged)
13. [Getting Help](#getting-help)

---

## Before You Contribute

Please take a moment to do the following before writing any code.

**Read the existing issues.** Someone may already be working on the problem you want to solve. Visit the [Issues tab](https://github.com/kayspace/gate-ae-prep/issues) and search for relevant keywords before opening a new issue or starting work.

**Read the README.** The `README.md` in this repository is the developer guide. It explains the architecture, directory structure, data storage approach, and key modules. Understanding this context will make your contribution faster and better.

**For major changes, open an issue first.** If you plan to add a new feature, restructure a module, change a data schema, or make any change that affects more than one file in a non-trivial way, open an issue and describe your plan before writing code. This avoids wasted effort if the direction does not fit the project.

**For small fixes, go ahead.** Typo fixes, grammar corrections in documentation, minor CSS tweaks, and single-line bug fixes do not need a prior issue. Just follow the workflow below.

---

## Ways to Contribute

### Reporting Bugs

If something does not work correctly, please open an issue using the [GitHub Issues tab](https://github.com/kayspace/gate-ae-prep/issues).

Before submitting, check whether the bug has already been reported. If an open issue already covers it, add a comment with any additional information you have rather than opening a duplicate.

A good bug report includes the following:

- A clear, descriptive title (e.g., `Video player does not resume from saved position on Firefox`)
- The browser and version you are using
- Step-by-step instructions to reproduce the bug
- What you expected to happen
- What actually happened
- Screenshots or screen recordings if the issue is visual
- Any error messages shown in the browser console (open with `F12` → Console tab)

The more detail you provide, the faster the bug can be investigated and fixed.

### Suggesting Features

If you have an idea for something that would improve the app, open an issue with the `enhancement` label.

A good feature request includes:

- A clear description of the feature
- The problem it solves or the workflow it improves
- Any relevant context (e.g., "As a student tracking 15 sections, I find it hard to...")
- An explanation of why it fits with the project's goals (local-first, no backend, desktop-focused)

Note that this project is intentionally minimal. Features that require a backend, a database, or user accounts are outside the scope of the project as designed.

### Improving Documentation

Documentation improvements are always welcome. This includes:

- Fixing typos or grammatical errors in `README.md`, `USER_GUIDE.md`, or any other `.md` file
- Clarifying existing explanations
- Adding missing explanations for modules or functions
- Adding or improving inline code comments for complex logic

Documentation-only changes follow the same workflow as code changes, but they are generally reviewed and merged faster.

### Code Contributions

Code contributions include bug fixes, feature implementations, refactors, and performance improvements. Follow the full workflow described in the sections below.

---

## Project Overview for Contributors

Before writing code, it helps to understand how the project is structured. Here is a brief summary. The full explanation is in `README.md`.

**Technology stack:**

- React with TypeScript
- TanStack Router and TanStack Start
- Vite as the build tool
- `localStorage` for all data persistence (no backend, no database)
- GSAP for entrance animations
- Vercel for deployment (the feedback feature requires Vercel serverless functions)

**Directory structure at a glance:**

```
src/
├── routes/         # Route files; index.tsx is the main shell
├── types/          # Shared TypeScript types (one file: index.ts)
├── lib/            # Pure utility functions (no React dependencies)
├── data/           # Static seed data
├── components/     # Reusable UI components and layout chrome
├── features/       # One folder per app tab/view
└── styles.css      # Design tokens and global styles
```

**Key things to know before editing code:**

- All data lives in `localStorage`. Keys are centralized in `src/lib/storage.ts`. Do not invent new keys without updating that file.
- The route file `src/routes/index.tsx` is intentionally thin. It owns top-level state and view selection only. Business logic belongs in `src/lib/` or the relevant feature module.
- Each tab (Syllabus, Books, Resources, etc.) is a self-contained feature under `src/features/<name>/`. Adding a new tab means creating a new folder there and wiring it up as described in `README.md`.
- TypeScript types are centralized in `src/types/index.ts`. Import from there; do not define types inline in component files.

---

## Setting Up Your Development Environment

Follow these steps exactly. If you run into a problem, open an issue with the `question` label.

### Prerequisites

You need the following tools installed on your machine:

- **Node.js** version 18 or higher. Download it from [nodejs.org](https://nodejs.org). To check your version, run `node --version` in a terminal.
- **npm** version 9 or higher (comes with Node.js). Check with `npm --version`.
- **Git**. Download from [git-scm.com](https://git-scm.com) if not already installed. Check with `git --version`.
- A code editor. [Visual Studio Code](https://code.visualstudio.com/) is recommended.

### Step 1: Fork the Repository

A fork is your personal copy of the repository on GitHub. You push changes to your fork, then open a pull request to propose those changes to the original repository.

1. Go to [https://github.com/kayspace/gate-ae-prep](https://github.com/kayspace/gate-ae-prep).
2. Click the **Fork** button in the top-right corner.
3. GitHub will create a copy of the repository under your own account.

### Step 2: Clone Your Fork Locally

Cloning downloads the repository to your local machine so you can work on it.

Open a terminal and run the following, replacing `your-username` with your actual GitHub username:

```bash
git clone git@github.com:your-username/gate-ae-prep.git
```

If you have not set up SSH keys with GitHub, use HTTPS instead:

```bash
git clone https://github.com/your-username/gate-ae-prep.git
```

Then navigate into the project directory:

```bash
cd gate-ae-prep
```

### Step 3: Add the Upstream Remote

This connects your local copy to the original repository so you can pull in future updates.

```bash
git remote add upstream https://github.com/kayspace/gate-ae-prep.git
```

Verify the remotes are set up correctly:

```bash
git remote -v
```

You should see output similar to this:

```
origin    git@github.com:your-username/gate-ae-prep.git (fetch)
origin    git@github.com:your-username/gate-ae-prep.git (push)
upstream  https://github.com/kayspace/gate-ae-prep.git (fetch)
upstream  https://github.com/kayspace/gate-ae-prep.git (push)
```

### Step 4: Install Dependencies

```bash
npm install
```

This installs all required packages as listed in `package.json`.

### Step 5: Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or whatever port Vite reports in the terminal). You should see the app running locally.

The development server supports hot module replacement — most changes to source files will appear in the browser instantly without a full page reload.

---

## Development Workflow

Every change, no matter how small, follows this workflow. Each step is explained in detail below.

### Step 1: Sync Your Fork with the Latest Changes

Before starting any new piece of work, make sure your local `master` branch is up to date with the original repository:

```bash
git checkout master
git pull upstream master
git push origin master
```

This prevents merge conflicts and ensures you are building on the latest code.

### Step 2: Create a New Branch

Never make changes directly on the `master` branch. Create a dedicated branch for every piece of work:

```bash
git checkout -b your-branch-name
```

See the [Branch Naming Conventions](#branch-naming-conventions) section below for how to name your branch correctly.

### Step 3: Make Your Changes

Edit the relevant files. Keep the following principles in mind as you work:

- Make changes in the most appropriate place. UI logic belongs in the relevant feature module. Shared utilities belong in `src/lib/`. Types belong in `src/types/index.ts`.
- Do not mix unrelated changes in one branch. If you notice a separate bug while working on a feature, open a separate issue and fix it in a separate branch.
- Keep the component files focused. If a file is growing very large, consider whether logic can be extracted to a helper in `src/lib/`.

### Step 4: Test Your Changes

Run the development server and verify your changes work as expected:

```bash
npm run dev
```

Run the linter to check for code style issues:

```bash
npm run lint
```

Run the formatter to ensure consistent code formatting:

```bash
npm run format
```

See the [Testing Your Changes](#testing-your-changes) section for a full checklist.

### Step 5: Commit Your Changes

Stage your changes and commit them:

```bash
git add .
git commit -m "type: short description of the change (#issue_number)"
```

See the [Commit Message Conventions](#commit-message-conventions) section for the correct format.

If your changes are not linked to a specific issue, omit the issue number:

```bash
git commit -m "fix: correct typo in SyllabusView component"
```

### Step 6: Push Your Branch to GitHub

```bash
git push origin your-branch-name
```

### Step 7: Open a Pull Request

1. Go to your fork on GitHub: `https://github.com/your-username/gate-ae-prep`
2. GitHub will show a banner saying your recently pushed branch is ready to compare. Click **Compare & pull request**.
3. If the banner does not appear, click the **Pull requests** tab and then **New pull request**.
4. Set the base repository to `kayspace/gate-ae-prep` and the base branch to `master`.
5. Fill in the pull request title and description using the [Pull Request Template](#pull-request-template) below.
6. Click **Create pull request**.

---

## Branch Naming Conventions

Branch names should be lowercase, use hyphens to separate words, and follow one of these prefixes:

| Prefix        | When to use                                      |
| ------------- | ------------------------------------------------ |
| `feature/`    | Adding a new feature or capability               |
| `fix/`        | Fixing a bug                                     |
| `refactor/`   | Restructuring code without changing behavior     |
| `update/`     | Updating dependencies, configuration, or content |
| `docs/`       | Documentation changes only                       |
| `experiment/` | Exploratory work that may or may not be merged   |

**Examples:**

```
feature/add-export-to-csv
fix/video-player-resume-position
refactor/storage-helpers
update/tanstack-router-version
docs/improve-readme-architecture-section
experiment/offline-mode-pwa
```

Even a one-line change should get its own branch. It keeps the repository clean and makes pull requests easy to review.

---

## Commit Message Conventions

Commit messages follow a simplified version of the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type: short description of the change (#issue_number)
```

The description should be in lowercase or as u please. The issue number is optional but encouraged when the commit relates to a tracked issue.

**Allowed types:**

| Type       | When to use                                                 |
| ---------- | ----------------------------------------------------------- |
| `feat`     | A new feature                                               |
| `fix`      | A bug fix                                                   |
| `refactor` | Code restructuring with no behavior change                  |
| `docs`     | Documentation changes only                                  |
| `style`    | Formatting, whitespace, or CSS changes with no logic change |
| `test`     | Adding or updating tests                                    |
| `chore`    | Build process, dependency updates, or configuration         |

**Examples:**

```
feat: add export progress to CSV (#12)
fix: prevent video player from resetting on tab switch (#7)
refactor: extract watch-state logic into useWatchState hook
docs: clarify localStorage key structure in README
style: apply consistent spacing in SyllabusView
chore: update vite to 5.4.0
```

---

## Code Style Guidelines

The project uses ESLint and Prettier for code quality and formatting. Running `npm run lint` and `npm run format` before committing is required.

Beyond automated tooling, follow these guidelines:

**TypeScript:**

- Use TypeScript for all new files. Do not use `any` unless there is a documented reason.
- Define all shared types in `src/types/index.ts`. Import from there rather than defining types locally in component files.
- Use explicit return types on utility functions in `src/lib/`.

**React components:**

- Use functional components with hooks. Do not write class components.
- Keep components focused on rendering. Move side-effect logic and data transformations to hooks or `src/lib/` utilities.
- Avoid prop drilling more than two levels deep. Lift state or use a context if necessary.

**Naming:**

- Use `PascalCase` for component files and component names: `SyllabusView.tsx`, `ConfirmModal.tsx`.
- Use `camelCase` for utility files and variable names: `storage.ts`, `loadJSON`, `topicKey`.
- Use descriptive names. `handleVideoProgress` is better than `onProg`.

**Formatting:**

- Indentation is 2 spaces.
- Use single quotes for strings in TypeScript and JavaScript.
- Keep lines under 100 characters where possible.
- Add a blank line between logical sections within a function.

**Comments:**

- Write comments for non-obvious logic. If a reader would have to think for more than a few seconds to understand what a block of code does, add a comment.
- Do not write comments that simply restate what the code does. `// increment counter` above `count++` adds no value.
- For complex algorithms or data transformations, briefly explain the intent and any edge cases handled.

**localStorage:**

- Never hardcode a storage key string. Always use the constants in `STORAGE_KEYS` from `src/lib/storage.ts`.
- Use `loadJSON()` for reading from storage. It handles JSON parse errors safely.
- Use `loadWatch()`, `saveWatch()`, and `clearWatchFor()` for watch-state operations.

---

## Testing Your Changes

This project does not currently have an automated test suite. Testing is manual for now.

Before opening a pull request, verify the following:

**Functional testing:**

- The specific feature or fix you changed works as expected
- All existing features still work (do not break things that were working before)
- Edge cases are handled: what happens with empty state, invalid input, or missing data

**Cross-browser testing:**

Test in at least two of the following browsers:

- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (if you are on macOS)

**localStorage behavior:**

- If your change touches storage, verify that data persists correctly after a page refresh
- Verify that clearing storage resets the app to a clean state
- Verify that your change does not corrupt existing stored data

**YouTube integration (if applicable):**

- If your change touches the Resources tab or video player, test with both a playlist URL and a single video URL
- Verify that watch progress is saved and resumed correctly
- Test the behavior when no API key is set

**Feedback feature (if applicable):**

- The feedback form requires a Vercel deployment to function. Local testing of the actual submission is not possible. Test only the form UI behavior locally.

**PDF books (if applicable):**

- If you add or modify PDFs in `public/books/`, run `npm run books` to regenerate `src/lib/books.ts` and verify the output looks correct.

**Build verification:**

Before submitting, confirm the production build succeeds:

```bash
npm run build
```

A build failure is a blocker and the pull request will not be merged until it is resolved.

---

## Pull Request Guidelines

### Before Submitting

Go through this checklist before opening the pull request:

- [ ] Your branch is up to date with `master` from the upstream repository
- [ ] `npm run lint` passes with no errors
- [ ] `npm run format` has been run and the output is committed
- [ ] `npm run build` completes successfully
- [ ] You have tested your changes manually in at least two browsers
- [ ] Existing functionality has not been broken
- [ ] Documentation has been updated if your change affects user-facing behavior or developer workflows
- [ ] Your commits follow the commit message conventions described above
- [ ] Your pull request is focused on one thing (one bug fix, one feature, one refactor)

### Review Process

Pull requests are reviewed by the maintainer or a designated reviewer. The review process includes:

- Checking that the code follows the project's conventions and style
- Verifying the described behavior matches what is implemented
- Asking questions or requesting changes where something is unclear or needs improvement
- Approving and merging once all feedback has been addressed

Please respond to review comments promptly. Pull requests with no activity for more than two weeks may be closed to keep the queue clean. You are welcome to reopen them if you return to the work.

---

## Pull Request Template

When creating a pull request, fill in the following sections. Replace the placeholder text with your actual content.

```
## What does this PR do?

A clear, concise description of the changes. For example:
"Adds a CSV export button to the Syllabus tab that downloads the user's current progress."

## Why is this needed?

The problem this solves or the improvement it makes. For example:
"Users have no way to share or back up their progress outside the browser."

## How was this tested?

List the testing steps you followed. For example:
- Opened the Syllabus tab with partial progress saved
- Clicked the export button
- Verified the downloaded CSV contains the correct topic keys and completion states
- Tested in Chrome and Firefox
- Confirmed existing Syllabus features (marking done, notes) still work

Include screenshots if the change affects the UI.

## Related issue

Fixes #<issue_number>

(If no issue exists, explain why. If this PR is part of a larger tracked issue but does not fully resolve it, use "Related to #<issue_number>" instead of "Fixes".)

## Checklist

- [ ] Code follows project style guidelines
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Changes have been tested manually
- [ ] Documentation updated (if needed)
- [ ] No breaking changes, or breaking changes are clearly documented in this description
```

---

## After Your PR is Merged

Once your pull request is merged, clean up your local and remote branches to keep things tidy.

**Delete the local branch:**

```bash
git checkout master
git branch -d your-branch-name
```

**Delete the remote branch:**

```bash
git push origin --delete your-branch-name
```

**Sync your fork:**

```bash
git pull upstream master
git push origin master
```

This ensures your fork is up to date and ready for your next contribution.

---

## Getting Help

If you are stuck or have a question about anything in this guide or about the project itself:

1. Check the [README.md](./README.md) for architectural and technical context.
2. Search existing [issues](https://github.com/kayspace/gate-ae-prep/issues) to see if your question has been answered.
3. Open a new issue with the `question` label. Describe what you are trying to do and where you are stuck.

---

Thank you for contributing to gate-ae-prep-tracker.
