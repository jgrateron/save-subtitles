# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Captures Google Meet subtitles (Spanish "Subtítulos" panel) and periodically downloads them as a `.txt` file.

Two delivery forms: a raw browser console script (`capturar.js`) and a Chrome extension (`extension/`).

## Chrome extension

Load `extension/` as an unpacked extension at `chrome://extensions/` (enable "Developer mode" → "Load unpacked").

Injects on `https://meet.google.com/*` at `document_idle`. Shows a floating toolbar (bottom-right) with three buttons:

- **Iniciar recolección** — starts a 60s collection interval and a 20min auto-download interval. Attempts to auto-enable captions by finding and clicking Meet's CC button. Falls back to a toast if the button isn't found.
- **Detener recolección** — stops both intervals.
- **Descargar** — triggers an immediate download and clears the localStorage backup.

**Persistence:** on every collection cycle, captions are saved to `localStorage`. If the tab is closed or crashes, data is restored on next page load with a toast notification. On tab close, a download is attempted and the browser shows a confirmation dialog to prevent accidental closes. The `pagehide` event writes a final backup. Downloaded data clears the backup.

## Raw console script

Paste `capturar.js` into the browser DevTools console while on a Google Meet call with captions enabled. Auto-starts collection immediately (unlike the extension, which waits for user to click "Iniciar").

## Behavior

- Captions collected from `div[aria-label="Subtítulos"]` every 60 seconds.
- Each entry formatted as `[timestamp]\ncaption text` from the two-line subtitle structure.
- Duplicate entries are deduplicated in-place — existing entries that are substrings of a new line get replaced.
