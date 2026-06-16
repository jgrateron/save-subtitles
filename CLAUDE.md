# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Captures Google Meet subtitles (Spanish "Subtítulos" panel) and periodically downloads them as a `.txt` file.

Two delivery forms: a raw browser console script (`capturar.js`) and a Chrome extension (`extension/`).

## Chrome extension

Load `extension/` as an unpacked extension at `chrome://extensions/` (enable "Developer mode" → "Load unpacked").

- Content script injects on `https://meet.google.com/*` at `document_idle`.
- Same collection/download logic as the console script.

## Raw console script

Paste `capturar.js` into the browser DevTools console while on a Google Meet call with captions enabled.

## Behavior

- Captions are collected from `div[aria-label="Subtítulos"]` every 60 seconds.
- The accumulated text file downloads automatically every 20 minutes and on page unload via `beforeunload`.
- Each entry is formatted as `[timestamp]\ncaption text` from the two-line subtitle structure.
- Duplicate entries are deduplicated in-place — existing entries that are substrings of a new line get replaced.
