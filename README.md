# Save Meet Subtitles

Automatically captures and downloads Google Meet captions as `.txt` files.

## Usage

### Chrome Extension (recommended)

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** (top-right corner).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this project.
5. Join a Google Meet call. A floating toolbar will appear at the bottom-right with three buttons:
   - **Start** — begins collecting captions every 60 seconds and attempts to auto-enable captions. Auto-downloads every 20 minutes.
   - **Stop** — stops collection and auto-download.
   - **Download** — triggers an immediate download of everything collected so far.

Data is backed up to `localStorage` on every collection cycle. If the tab is accidentally closed or crashes, captions are restored the next time you open Meet.

### Console Script

1. Copy the contents of `capturar.js`.
2. During a Google Meet call with captions enabled, open Developer Tools (F12) and go to the **Console** tab.
3. Paste the script and press Enter.

Collection starts immediately and auto-downloads every 20 minutes.

## File Naming

Files are named with the meeting code followed by date and time:

```
cea-bfrq-sen_2026-06-16T10-30-00-000Z.txt
```

This makes it easy to identify which meeting each file belongs to.

## How It Works

- Captions are extracted from Google Meet's `div[aria-label="Subtítulos"]` panel.
- Each entry is formatted as `[timestamp]\ncaption text`.
- Duplicate lines are automatically deduplicated.
