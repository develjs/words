---
name: add-book
description: Add a new preset book/text to the app from a URL or a local file. Downloads (or copies) the text, saves it as public/static/<slug>.txt with a slug filename derived from the book title (mask [\w-]+), and registers it in public/static/texts.json so it shows up as a preset in the Source tab. Use when the user wants to add a book/text/preset from a URL or file path.
allowed-tools: Bash(node lib/save-text.js:*) Read(/public/static/**) Write(/public/static/**) Edit(/public/static/texts.json) Glob
---

# add-book

Add a text as a reusable preset. The result must be a plain-text file in `public/static/` plus an entry in `public/static/texts.json`.

## How presets work

- `Source.vue` fetches `static/texts.json` — a JSON array of paths like `"static/bigband.txt"` (relative to the served root, **not** `public/`).
- Each entry is shown as a preset link labeled by its filename without extension.
- The file itself is served from `public/static/<name>.txt` (Vite copies `public/` → `docs/static/` at build time).

## Critical rules

- **Write only into `public/static/`** — never `docs/` (that's the generated build, gitignored).
- **Save plain UTF-8 text.** Presets are `.txt`; the app `fetch`es and displays them verbatim.
- **Run from the project root via the Bash tool** (Git Bash). Use `curl`/`cp` there, not PowerShell.
- **Filename mask:** `<slug>.txt` where `<slug>` matches `[a-z0-9_-]+` — lowercase ASCII, words and hyphens only, no spaces/extension elsewhere.

## Procedure

1. **Identify the source and the slug.**
   - Source = a URL (`http(s)://…`) or a local file path.
   - Slug priority: an explicit name the user gave → else the book title inferred from the URL/file name or page title (e.g. `pooh.txt_with-big-pictures.html` → `winnie-the-pooh`, `ann-from-green-gables.txt` → `ann-from-green-gables`). Normalize to the `[a-z0-9_-]+` mask.
   - Refuse/adjust if the slug would collide with an existing `public/static/<slug>.txt` unless the user wants to overwrite.

2. **Get the content into `public/static/<slug>.txt`** with the `lib/save-text.js` script. It fetches the URL (or reads the local file), extracts readable text from HTML (joins `<p>` text, falls back to the whole document), and writes plain UTF-8. `--save` resolves against `process.env.PWD`, so run from the project root via the Bash tool.
   - **From a URL:**
     ```bash
     node lib/save-text.js --url "<URL>" --save "public/static/<slug>.txt"
     ```
   - **From a local file:**
     ```bash
     node lib/save-text.js --file "<path>" --save "public/static/<slug>.txt"
     ```
   The script prints `chars`/`words` of the saved text. Its HTML extraction mirrors the analyzer CLI — pages with no `<p>` (or JS-rendered SPAs like a news section front page) yield little usable text, so prefer a plain-text source when one exists.

3. **Sanity-check** the saved file: it exists, is non-empty, and looks like prose (not raw HTML/JSON, not a few stray words). Report char/word count. If it looks empty or like markup, stop and tell the user instead of registering it.

4. **Register in `public/static/texts.json`.** Append `"static/<slug>.txt"` to the JSON array if not already present. Keep it valid JSON with the existing 4-space indentation. Do not reorder or remove existing entries.

5. **Report:** the saved file path, the `texts.json` entry, char/word count, and that the preset appears in the Source tab on the next dev reload / build. Note both files are git-tracked changes under `public/static/`.

## Tips

- To immediately measure the new text's difficulty, follow up with the `analyze-url` skill (it runs the vocabulary analyzer).
- If the user only has pasted text (no URL/file), write it straight to `public/static/<slug>.txt` and register it the same way.
