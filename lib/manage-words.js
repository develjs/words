/*
 * Manage the CEFR frequency list public/static/10000.txt and keep the level
 * boundaries in public/static/levels.json in sync automatically.
 *
 * The two files are tightly coupled: a word's CEFR level is its 0-based rank in
 * 10000.txt, and levels.json holds the index cut-offs { a1, a2, b1, b2, c1 }.
 * Inserting/removing a line shifts every later rank, so the boundaries must move
 * too. This script does that by remembering the *word* at each boundary (the
 * first word of the next level) before editing, then re-locating it afterwards —
 * so every word that stays in the list keeps the exact level it had.
 *
 * Usage:
 *   node lib/manage-words.js remove <word> [word2 ...]
 *   node lib/manage-words.js add <word> [word2 ...] (--after <word> | --before <word> | --rank <n> | --end)
 *   node lib/manage-words.js where <word> [word2 ...]      # query rank + level, no changes
 *
 * Paths resolve from the repo root (relative to this file), so it runs from any
 * cwd, under PowerShell or Bash.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIST_FILE = path.join(ROOT, 'public/static/10000.txt');
const LEVELS_FILE = path.join(ROOT, 'src/levels.json');
const LEVEL_KEYS = ['a1', 'a2', 'b1', 'b2', 'c1']; // ordered level keys
const LABELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Import levels at module load time
const LEVELS = JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8'));

const norm = w => w.trim().toLowerCase();

function readList() {
    return fs.readFileSync(LIST_FILE, 'utf8').split(/\r?\n/).map(norm).filter(Boolean);
}
function writeList(list) {
    fs.writeFileSync(LIST_FILE, list.join('\n') + '\n');
}

// classify a 0-based index against boundaries -> 'A1'..'C2'
function labelFor(index, list) {
    for (let i = 0; i < LEVEL_KEYS.length; i++) {
        const anchor = LEVELS[LEVEL_KEYS[i]];
        const idx = list.indexOf(anchor);
        if (idx >= 0 && index < idx) return LABELS[i];
    }
    return 'C2';
}

// Capture anchor words from the OLD list.
// Returns suffixes starting at each anchor's position; if anchor is removed,
// we fall back to the next surviving word in the suffix.
function captureMarkers(list) {
    return LEVEL_KEYS.map(k => {
        const anchor = LEVELS[k];
        const idx = list.indexOf(anchor);
        return idx >= 0 ? list.slice(idx) : [];
    });
}

function recomputeLevels(newList, markers) {
    const pos = new Map();
    newList.forEach((w, i) => { if (!pos.has(w)) pos.set(w, i); });
    const out = {};

    LEVEL_KEYS.forEach((k, i) => {
        const suffix = markers[i];
        let foundWord = LEVELS[k]; // default: keep the anchor

        for (const w of suffix) {
            if (pos.has(w)) {
                foundWord = w;
                break;
            }
        }

        out[k] = foundWord;
    });
    return out;
}

function parseAddOpts(rest) {
    const words = [];
    let after = null, before = null, rank = null, end = false;
    for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t === '--after') after = norm(rest[++i] || '');
        else if (t === '--before') before = norm(rest[++i] || '');
        else if (t === '--rank') rank = parseInt(rest[++i], 10);
        else if (t === '--end') end = true;
        else if (t.startsWith('--')) { console.error('Unknown flag:', t); process.exit(1); }
        else words.push(norm(t));
    }
    return { words, after, before, rank, end };
}

function main() {
    const [, , cmd, ...rest] = process.argv;

    if (cmd === 'where') {
        const list = readList();
        for (const raw of rest) {
            const w = norm(raw);
            const idx = list.indexOf(w);
            if (idx < 0) console.log(`${w}: not in list`);
            else console.log(`${w}: rank ${idx + 1} (index ${idx}) -> ${labelFor(idx, list)}`);
        }
        return;
    }

    if (cmd === 'remove') {
        const words = rest.map(norm).filter(Boolean);
        if (!words.length) { console.error('Usage: remove <word> [word2 ...]'); process.exit(1); }
        const list = readList();
        const markers = captureMarkers(list);
        const toRemove = new Set(words);
        const found = new Set();
        const newList = list.filter(w => {
            if (toRemove.has(w)) { found.add(w); return false; }
            return true;
        });
        const missing = words.filter(w => !found.has(w));
        const newLevels = recomputeLevels(newList, markers);
        writeList(newList);
        fs.writeFileSync(LEVELS_FILE, JSON.stringify(newLevels, null, 2) + '\n');
        report({ action: 'remove', before: list.length, after: newList.length,
            done: [...found], missing, oldLevels: LEVELS, newLevels });
        return;
    }

    if (cmd === 'add') {
        const { words, after, before, rank, end } = parseAddOpts(rest);
        if (!words.length) { console.error('Usage: add <word> [word2 ...] (--after <w> | --before <w> | --rank <n> | --end)'); process.exit(1); }
        const list = readList();
        const markers = captureMarkers(list);

        // skip words already present
        const present = new Set(list);
        const dupes = words.filter(w => present.has(w));
        const fresh = words.filter((w, i) => present.has(w) ? false : words.indexOf(w) === i);
        if (!fresh.length) { console.error('Nothing to add (all already present):', dupes.join(', ')); process.exit(1); }

        // resolve insert index
        let at;
        if (rank != null && !Number.isNaN(rank)) at = Math.max(0, Math.min(rank, list.length));
        else if (after) { const i = list.indexOf(after); if (i < 0) { console.error('--after word not found:', after); process.exit(1); } at = i + 1; }
        else if (before) { const i = list.indexOf(before); if (i < 0) { console.error('--before word not found:', before); process.exit(1); } at = i; }
        else if (end) at = list.length;
        else { console.error('Specify a position: --after <w> | --before <w> | --rank <n> | --end'); process.exit(1); }

        const newList = [...list.slice(0, at), ...fresh, ...list.slice(at)];
        const newLevels = recomputeLevels(newList, markers);
        writeList(newList);
        fs.writeFileSync(LEVELS_FILE, JSON.stringify(newLevels, null, 2) + '\n');
        report({ action: 'add', before: list.length, after: newList.length,
            done: fresh, missing: [], dupes, oldLevels: LEVELS, newLevels,
            added: fresh.map(w => `${w} -> rank ${newList.indexOf(w) + 1} (${labelFor(newList.indexOf(w), newList)})`) });
        return;
    }

    console.error('Usage:\n  node lib/manage-words.js remove <word> [word2 ...]\n  node lib/manage-words.js add <word> [word2 ...] (--after <w> | --before <w> | --rank <n> | --end)\n  node lib/manage-words.js where <word> [word2 ...]');
    process.exit(1);
}

function report({ action, before, after, done, missing, dupes, oldLevels, newLevels, added }) {
    console.log(`${action}: ${done.length} word(s), list ${before} -> ${after} lines`);
    if (done.length) console.log('  ' + (action === 'add' ? 'added: ' : 'removed: ') + done.join(', '));
    if (added && added.length) added.forEach(a => console.log('    ' + a));
    if (dupes && dupes.length) console.log('  skipped (already present): ' + dupes.join(', '));
    if (missing && missing.length) console.log('  NOT FOUND (skipped): ' + missing.join(', '));
    const fmt = l => LEVEL_KEYS.map(k => `${k}=${l[k]}`).join(' ');
    console.log('  levels old: ' + fmt(oldLevels));
    console.log('  levels new: ' + fmt(newLevels));
}

main();
