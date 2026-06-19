/*
 * Fetch a URL or read a local file, extract plain text (HTML -> <p> text),
 * and save it as a .txt file under the project (e.g. public/static/<name>.txt).
 *
 * Usage:
 *   node lib/save-text.js --url <URL> --save <relative/path.txt>
 *   node lib/save-text.js --file <path> --save <relative/path.txt>
 *
 * --save is resolved against process.env.PWD (POSIX-style env, like analize-text.js),
 * so run it via the Bash tool from the project root, not PowerShell.
 */
import axios from 'axios';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { loadText, saveText } from './io-misc.js';

// extract readable text from HTML the same way analize-text.js does:
// join <p> text (dropping nested <p>), or fall back to the whole document.
function htmlToText(html) {
    const root = parse(html);
    const pars = [...root.querySelectorAll('p')];

    if (pars.length) {
        return pars.map(p => {
            for (const child of [...p.querySelectorAll('p')]) {
                p.removeChild(child);
            }
            return p.rawText;
        }).join('\n\n');
    }

    console.log('Warning: no paragraphs, using whole document text');
    return root.rawText;
}

function looksLikeHtml(text) {
    return /^\s*<(?:!doctype|html|head|body|p|div)\b/i.test(text)
        || /<\/(?:p|div|body|html)>/i.test(text);
}

async function fromUrl(location) {
    const res = await axios.get(location);
    const type = res.headers['content-type'] || '';

    if (type.includes('text/plain')) return String(res.data);
    if (type.includes('text/html')) return htmlToText(String(res.data));

    // unknown content-type: sniff the payload
    const data = String(res.data);
    return looksLikeHtml(data) ? htmlToText(data) : data;
}

async function fromFile(file) {
    const data = await loadText(file);
    return looksLikeHtml(data) ? htmlToText(data) : data;
}

async function main() {
    const
        argv = process.argv,
        URL = argv[(argv.indexOf('--url')+1)||-1],
        FILE = argv[(argv.indexOf('--file')+1)||-1],
        SAVE = argv[(argv.indexOf('--save')+1)||-1];

    if ((!URL && !FILE) || !SAVE) {
        console.error('Usage: node lib/save-text.js (--url <URL> | --file <path>) --save <relative/path.txt>');
        process.exit(1);
    }

    console.log('fetch', URL || FILE);
    const text = URL ? await fromUrl(URL) : await fromFile(FILE);

    const target = path.join(process.env.PWD, SAVE);
    await saveText(target, text);

    const info = {
        source: URL || FILE,
        save: target,
        chars: text.length,
        words: (text.match(/\S+/g) || []).length
    };
    console.log('saved to', target);
    console.log(JSON.stringify(info, 0, '\t'));
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
