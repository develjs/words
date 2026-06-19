---
name: manage-words
description: Add or remove words in the CEFR frequency list public/static/10000.txt and keep the level boundaries in src/data/levels.json in sync automatically. Use when the user wants to insert, delete, reorder, or re-rank words in the 10000-word reference list, fix a word's CEFR level, or move proper nouns/junk out of the frequency list — anything that edits 10000.txt where the levels must follow.
---

# manage-words

Edit the frequency list `public/static/10000.txt` and update the CEFR boundaries in `src/data/levels.json` in one step, via `lib/manage-words.js`. **Never hand-edit `10000.txt` line-by-line** — every insert/delete shifts the rank of all later words and silently breaks the level boundaries.

## Why a script (the coupling)

A word's CEFR level (A1–C2) is purely its **0-based rank in `10000.txt`**; `levels.json` holds the index cut-offs `{ a1, a2, b1, b2, c1 }` (`index < a1` → A1, `< a2` → A2, … `< c1` → C1, else C2). So the files are coupled: changing `10000.txt` requires moving the boundaries so existing words keep their level. The script does this by capturing the **word at each boundary** (the first word of the next level) before editing, then re-locating it afterward. If a boundary's marker word is itself removed, it falls back to the next surviving word at/after that boundary.

## Commands

Run from the project root (works under PowerShell or Bash — paths resolve from the repo root, not `PWD`):

```bash
# Remove one or more words (missing words are reported and skipped)
node lib/manage-words.js remove <word> [word2 ...]

# Add words at a position — pick exactly one location flag:
node lib/manage-words.js add <word> [word2 ...] --after  <existing-word>
node lib/manage-words.js add <word> [word2 ...] --before <existing-word>
node lib/manage-words.js add <word> [word2 ...] --rank   <n>          # 0-based index
node lib/manage-words.js add <word> [word2 ...] --end                 # least-frequent (C2)

# Query a word's current rank + level (read-only, no changes)
node lib/manage-words.js where <word> [word2 ...]
```

Each `add`/`remove` rewrites both `10000.txt` and `levels.json` and prints a report: words done/skipped/not-found, list line count before→after, the level of each added word, and old vs new boundaries.

## Choosing a position for `add`

The frequency list is **ordered by frequency** (rank 1 = most common). A word's rank determines its level, so place it where its real frequency belongs:

- Know a comparable word? Use `--after <word>` / `--before <word>` (e.g. add a synonym right next to an existing one).
- Want a specific level? Use `--rank <n>`: pick `n` inside the target band from the current `levels.json` (e.g. an A2 word → an `n` between `a1` and `a2`). Run `where` on a few neighbors first to sanity-check.
- Genuinely rare word with no good anchor → `--end`.

## Procedure

1. **Inspect first.** Run `where <word>` on the affected words (and a neighbor or two) to see current ranks/levels and confirm the words exist / don't already exist.
2. **Apply** the `add` or `remove` command. Words are lowercased automatically; multiple words in one call are fine.
3. **Read the report.** Confirm the right count changed, nothing landed under "NOT FOUND" or "skipped (already present)" unexpectedly, and the new boundaries look sane (still non-decreasing).
4. **Report to the user:** which words changed, the line-count delta, and the old→new boundary values. Both files are git-tracked changes — `public/static/10000.txt` and `src/data/levels.json`.

## Notes & gotchas

- **Levels are preserved, not recomputed from scratch.** The script keeps every surviving word at the level it already had; it does not re-derive levels from an external source. That's intentional — boundaries reflect prior curation.
- Moving proper nouns out of the list is the common case: `remove` them here (they typically belong in `public/static/knowns.list` — see the `add-book`/knowns flow). This skill does **not** touch `knowns.list`; handle that separately.
- The boundaries stay valid only if you go through this script. If `10000.txt` was edited by hand, `levels.json` is likely stale — re-derive it before trusting levels.
- Don't edit the generated `docs/` copy; source data lives in `public/static/` (Vite copies it at build time).
