---
name: analyze-url
description: Analyze the vocabulary of a text/book at a URL using the project's Node CLI (lib/analize-text.js). Fetches the URL, computes word frequency and CEFR vocabulary index, and saves per-document JSON into .cache/ under a human-readable filename derived from the book/text title. Use when the user gives a URL (plain text or HTML article/book) and wants its vocabulary analyzed, difficulty/index measured, or a JSON report generated.
---

# analyze-url

Run the project's headless vocabulary analyzer on a URL and save a readable, well-named JSON report into `.cache/`.

## What the CLI does

`lib/analize-text.js` fetches the URL (plain text directly; HTML via `<p>` extraction), tokenizes with the shared `WordsHandler` (suffix-merging on), and reports:

- `fileSize`, `wordsCount`, `vocabulary` (unique words)
- `index-85` / `index-90` — how many of the most-frequent words cover 85% / 90% of *this text*
- `absIndex-85` / `absIndex-90` — same, but measured against the 10000.txt frequency reference (lower = easier / closer to common English)

The full word→count map is appended under `words` in the saved JSON.

## Critical environment rules

- **Always run through the Bash tool, never PowerShell.** The CLI resolves `--save` and the stats DB via `process.env.PWD`, which Git Bash sets but PowerShell does not.
- **Run from the project root** (`/c/Users/Aleksei_Beliaev/Dev/words`). `--save` is joined with `$PWD`, so a relative path like `.cache/<name>.json` lands in the repo's `.cache/`.

## Procedure

1. **Decide the filename slug** from context, in this priority:
   - an explicit name the user gave;
   - otherwise the book/text title — infer it from the URL path (e.g. `.../pooh.txt...` → `winnie-the-pooh`, `.../ann-from-green-gables.txt` → `ann-from-green-gables`). If the title is unclear from the URL, fetch the page with WebFetch and read its `<title>`/heading.
   - Normalize to kebab-case, lowercase, ASCII only, no extension. Keep it short and recognizable.

2. **Run the analyzer**, saving into `.cache/`:
   ```bash
   node lib/analize-text.js --url "<URL>" --save ".cache/<slug>.json"
   ```

3. **Report a readable summary** to the user — not the raw JSON dump. Include: title/slug, word count, unique vocabulary, and the four indices, with a one-line plain-language read on difficulty (e.g. "absIndex-85 ≈ N means ~N common words cover 85% of the book → roughly intermediate"). Mention the saved path.

## Side effects to surface

- The CLI **also** merges this document's metrics into `public/static/list.json` (a git-tracked file), keyed by `<hostname>-<hash>`. Tell the user this happened. If they only wanted the cache file and not a repo change, offer to `git checkout -- public/static/list.json`.
- If `.cache/` is not yet gitignored, note that the new JSON is untracked and could be committed by accident.

## Notes

- Only plain-text and HTML content types work; other types throw `Unknown type`.
- HTML with no `<p>` tags falls back to the whole document text (noisier results) — the CLI logs a warning.
- Re-running the same URL overwrites the same-named cache file and refreshes the `list.json` entry (keyed by content hash, so identical content reuses the key).
