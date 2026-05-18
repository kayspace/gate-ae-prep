# gate ae — user guide

Welcome to the gate ae prep.

This tool is built to help you stay organized while preparing for gate ae paper.

## What this page is for

This guide explains how to use each section of the tool so you can start tracking your prep immediately.

## Syllabus section

This is the main study tracker.

- The syllabus contains all gate ae sections.
- Each section is split into **core** and **special** topics.
- Tick the checkbox when you finish a topic.
- Completion progress is tracked automatically.
- Use the notes box at the bottom of a section to save doubts, reminders, or quick formulas.

## Books section

Use this section to access your PDF study materials.

- The app shows PDFs stored in section folders.
- Keep each file in the matching section folder under `public/books/<section>/`.
- Use clear file names so your book library is easy to scan.

## Resources section

This is where you store videos, playlists, and study links.

### What you can save

- individual videos,
- full YouTube playlists,
- any general study link.

### How to add a resource

1. Choose the AE section you want to attach the resource to.
2. Enter a title (optional).
3. Paste the resource URL.
4. Click **add**.

### Playlist mode

If you add a YouTube playlist, the app treats it like a course.

- It loads every video in the playlist.
- You can tick each video as you watch it.
- It shows playlist progress with a progress bar.
- You can refresh the playlist if it changes.

### YouTube Data API key

Playlist loading requires a YouTube Data API key. This key allows the app to fetch video details from your playlists. It is free to set up and is a one-time process.

The key is stored only in your browser — it never leaves your machine.

#### Step-by-step setup

**Step 1: Open Google Cloud Console**

1. Go to `https://console.cloud.google.com/`
2. You will see a page that looks like a dashboard with various options.
3. If you are not logged in, click the **Sign In** button in the top right and use your Google account (Gmail, etc).

**Step 2: Create a new project**

1. At the top left, you will see a dropdown that says **Select a Project** or shows a project name.
2. Click on it.
3. A popup window will appear.
4. Click the **NEW PROJECT** button (usually in the top right of the popup).
5. A form will appear asking for a project name. Type something like `gate-ae` or `prep-tracker`.
6. Click **CREATE**.
7. Wait for the project to be created (it may take a few seconds).
8. Once created, you will be taken to the project dashboard.

**Step 3: Enable the YouTube Data API**

1. On the left sidebar, look for **APIs & Services** and click it.
2. You will see a menu expand. Click on **Library**.
3. You will see a search box at the top that says "Search for APIs & services".
4. Type `YouTube Data API` in the search box and press Enter.
5. You will see a result called **YouTube Data API v3**. Click on it.
6. You will be taken to the API details page.
7. Click the blue **ENABLE** button.
8. Wait a moment for the API to be enabled. You will see a message saying the API is enabled.

**Step 4: Create an API key**

1. After enabling the API, you will see a button that says **CREATE CREDENTIALS** (usually blue).
2. Click on it.
3. A form will appear with a dropdown that says **What data are you using?** Select **Public Data**.
4. Another dropdown will appear asking **Which API are you using?** The YouTube Data API v3 should already be selected. If not, select it.
5. Click the blue **NEXT** button.
6. You will see another screen. Click **CREATE API KEY**.
7. A popup will appear showing your new API key. It looks like a long string of letters and numbers starting with `AIza...`.
8. **Copy this key** by clicking the copy icon next to it, or by selecting the text and pressing Ctrl+C (or Cmd+C on Mac).

**Step 5: Add the key to the app**

1. Open the gate ae prep app in your browser.
2. Click the **resources** tab.
3. At the top, you will see a box labeled **yt data api key**.
4. Click the **show** button to reveal the input field.
5. Paste the API key you copied from Google Cloud (Ctrl+V or Cmd+V).
6. The app will automatically save the key to your browser.
7. You should see a message saying the key is set.

**Done!**

Now you can add YouTube playlists to your resources, and the app will automatically load all the videos in the playlist with thumbnails and titles.

#### If something goes wrong

- **"Error: Invalid API key"** — double-check that you copied the entire key correctly. It should start with `AIza`.
- **"API not enabled"** — go back to the Google Cloud console and make sure you clicked the ENABLE button for YouTube Data API v3.
- **"Quota exceeded"** — the free tier allows a certain number of API calls. If you hit the limit, wait 24 hours and try again. For normal prep use, this is very unlikely.

#### What if you don't add a key?

You can still:

- Save individual video links
- Save general study links
- Manually track videos in your notes

What you cannot do:

- Auto-load playlist videos with titles and thumbnails
- Track watch progress for entire playlists

#### Security note

- The API key is stored locally in your browser only.
- It is not sent to any server except Google's API (to fetch playlist data).
- You can delete or regenerate the key anytime from the Google Cloud console.
- The free tier has usage limits, but normal prep use will not exceed them.

### Recommended playlist links

Paste links like:

- `https://youtube.com/playlist?list=PL...`
- `https://www.youtube.com/playlist?list=PL...`

The app detects playlist links automatically.

## Formulas section

This section is your formula notebook.

- Choose a section and add formulas or quick reference notes.
- It is plain text and saved in the browser.
- Keep notes short and easy to scan while studying.

## Log section

This section shows your overall progress.

- It summarizes how many topics are complete.
- Use it to see which sections need more attention.
- It helps you keep your prep balanced.

## Privacy and storage

- The tool does not require any login.
- Your data stays in your browser only.
- Clearing browser storage will delete your saved progress, notes, and resources.

## Quick tips

- Start with one section and complete its core topics first.
- Add resources as you find them so they stay organized.
- Use the notes box to save doubts and formula reminders.
- Check the log often to track your progress.

## Need help?

If you want a quick refresher, open the guide tab in the app.
