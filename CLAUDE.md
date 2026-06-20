# CLAUDE.md

This file provides guidance to AI coding assistants (Claude Code and Grok) when working with code in this repository.

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
`public/static/10000.txt` is the reference list of the 10,000 most common English words, ordered by frequency. A word's CEFR level (A1–C2) is derived purely from its **rank/index in this list** (see `level()` in `src/components/WordsList.vue` and the `etalon` "absolute index" in the CLI).

The boundary constants live in `public/static/levels.json` (`{ a1, a2, b1, b2, c1 }`, fetched at runtime into the Vuex store alongside `10000.txt`; `store.js` keeps a `DEFAULT_LEVELS` fallback). These are **0-based index cut-offs into `10000.txt`**: `level()` classifies a word by its `list10000.indexOf(word)` — `index < a1` → A1, `< a2` → A2, … `< c1` → C1, otherwise C2. So `levels.json` and `10000.txt` are tightly coupled: **any insert/delete in `10000.txt` shifts every rank after it and invalidates the boundaries.** Never hand-edit these files. Always use the `manage-words` skill (or `/manage-words` in Grok). It edits the list and automatically keeps the level boundaries in sync.

The skill supports these commands (run from the project root):

```bash
node lib/manage-words.js remove <word> [word2 ...]
node lib/manage-words.js add <word> [word2 ...] (--after <w> | --before <w> | --rank <n> | --end)
node lib/manage-words.js where <word> [word2 ...]   # read-only rank+level query
```

It keeps each boundary pointed at the word that begins the next level (with a fallback if that word is removed). Paths resolve from the repo root, so it runs under PowerShell or Bash.

Data files live in `public/static/` (Vite's `public/` dir): they are served at `/static/…` in dev and copied to `docs/static/` by the build — so source data edits go in `public/static/`, never the generated `docs/`.

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
- **Language**: All code comments, documentation files (including `CLAUDE.md`, `README.md`, `SKILL.md`, and any other `.md` files), and commit messages must be written in English.

- **Persistent rules (Agent Rules)**: When the user asks you to *always* do something, always remember/understand something, or follow a specific behavior going forward (phrases like "always...", "from now on...", "remember that...", "make sure you always..."), proactively add the instruction to this file (CLAUDE.md). This document serves as the persistent agent rules for the project.

- **Scratch files go in `.cache/`.** Any throwaway/one-off script, temp data dump, or working file you create while doing a task belongs in `.cache/` (gitignored) — not in `scripts/`, `lib/`, or the repo root. Only commit a script under `lib/` when it's a deliberate, reusable tool (e.g. `lib/manage-words.js`). This keeps one-off helpers out of version control.
- ESLint config (`.eslintrc.js`) extends `eslint:recommended` + `plugin:vue/essential` (parser `vue-eslint-parser`); linting is a standalone `npm run lint`, not part of the build.
- `@` is a Vite alias for `src/` (see `vite.config.js`).
- The build targets `docs/` (gitignored, not committed); `base` is relative (`./`) for production. On push to `master`, `.github/workflows/deploy.yml` runs `npm run build` and publishes `docs/` to GitHub Pages via the official Pages Actions — the repo's Pages source must be set to "GitHub Actions".

- **Use skills for repeatable tasks.** For common workflows (editing the frequency list, adding presets, analyzing texts by URL), prefer the dedicated skills in the `skills/` folder over manual steps.

## Skills

Reusable procedures are defined as **skills**. They are stored in the `skills/` directory at the project root (not under `.grok/skills/`).

