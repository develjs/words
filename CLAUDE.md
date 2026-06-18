# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # Vite dev server with HMR at localhost:8080 (alias: npm start)
npm run build        # production build → outputs to docs/ (GitHub Pages)
npm run preview      # serve the production build from docs/ locally
npm run lint         # eslint over .js and .vue files in src/
npm test             # run lib/ unit tests via the built-in node:test runner
```

Tests live in `test/` and exercise the shared `lib/words.js` core (`node --test`).

The `check-*` scripts run the Node CLI analyzer against a fixed URL, e.g.:
```bash
npm run check-big    # analyze a preset text and save JSON
node lib/analize-text.js --url <URL> [--save <relative/path.json>]
```
The CLI reads `process.env.PWD` to resolve `--save` and the stats DB paths, so it expects a POSIX-style environment (run via the Bash tool, not PowerShell, on Windows).

## Architecture

This is a vocabulary-analysis tool, **Browser SPA** application with additional two independent tools:

- Main application (`src/`) — a Vue 2.7 app built with Vite (`@vitejs/plugin-vue2`) where the user pastes text or picks a preset, and sees the unique words ranked by frequency and CEFR difficulty.

- **Node CLI** (`lib/analize-text.js`) — fetches a URL (plain text or HTML), analyzes it headlessly, and writes per-document JSON plus an aggregate stats DB.

### Shared core: `lib/words.js`
`WordsHandler` is the heart of the app and is used by both front-ends. It tokenizes text (`TERMINATORS` regex), normalizes/filters words (`WRONG_WORDS`, `WRONG_CHARS`), counts occurrences, and optionally merges suffix variants (`SUFFIXES = es, s, ed, ly, ing`) into a single base form when `options.noSuffix` is set. `getIndex(threshold, etalon)` computes the "vocabulary index" — how many of the most-frequent words cover a given fraction (e.g. 85%) of the text, optionally measured against an external reference word list.

### The 10000-word frequency list drives CEFR levels
`public/static/10000.txt` is the reference list of the 10,000 most common English words, ordered by frequency. A word's CEFR level (A1–C2) is derived purely from its **rank/index in this list** (see `level()` in `src/components/WordsList.vue` and the `etalon` "absolute index" in the CLI). When changing level thresholds, update both this list reference and the boundary constants. Data files live in `public/static/` (Vite's `public/` dir): they are served at `/static/…` in dev and copied to `docs/static/` by the build — so source data edits go in `public/static/`, never the generated `docs/`.

### Vuex store (`src/js/store.js`)
Single source of truth for the SPA. Holds `words`/`counts` (backed by the shared `WordsHandler` instance), `list10000`, and `knowns`. Key flow:
- `parseText` **action** lazily fetches `static/10000.txt` into `list10000`, then commits the `parseText` mutation which runs `wordsHandler.parse(...)` and sorts.
- **"Knowns"** (words the user already knows) are loaded from `static/knowns.list`, then user edits are persisted to `localStorage` as two diff lists — `add-knowns` and `del-knowns` — rather than the full set (`localSave`/`localLoad`). Known words are filtered out of results.

### Components (`src/`)
- `App.vue` — three-tab shell (Source / Words / Knowns); relies on the global Materialize CSS object `M` for tabs, selects, and textarea auto-resize.
- `Source.vue` — text input + presets loaded from `static/texts.json` (a list of `.txt` paths).
- `WordsList.vue` — the results table with toggles for suffix-merging and count-sort, plus a CEFR level filter.
- `Knowns.vue` — manage the known-words list.

### CLI specifics (`lib/analize-text.js`, `lib/io-misc.js`)
- Plain-text URLs are parsed directly; HTML is parsed via `node-html-parser`, extracting `<p>` text. An MD5 hash of the content identifies each document.
- Per-document output goes to `--save` (or `.cache/<host>-<hash>.json`); summary metrics are also merged into the aggregate `public/static/list.json` stats DB.

## Conventions
- ESLint config (`.eslintrc.js`) extends `eslint:recommended` + `plugin:vue/essential` (parser `vue-eslint-parser`); linting is a standalone `npm run lint`, not part of the build.
- `@` is a Vite alias for `src/` (see `vite.config.js`).
- The build deliberately targets `docs/` so the app is served from GitHub Pages; `base` is relative (`./`) for production.
