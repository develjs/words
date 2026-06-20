import test from 'node:test';
import assert from 'node:assert';
import { WordsHandler, groupWordsByBase } from '../lib/words.js';

test('parse counts repeated words and ignores punctuation/case', () => {
    const h = new WordsHandler();
    h.parse('Cat cat dog.');
    assert.deepStrictEqual(h.getCounts(), { cat: 2, dog: 1 });
    assert.strictEqual(h.getCount(), 3);
});

test('parse filters WRONG_WORDS and words with WRONG_CHARS', () => {
    const h = new WordsHandler();
    h.parse('good s ll bad42');
    // 's' and 'll' are in WRONG_WORDS; 'bad42' contains digits (WRONG_CHARS)
    assert.deepStrictEqual(h.getWords().sort(), ['good']);
});

test('noSuffix merges a suffixed form into its base word', () => {
    const h = new WordsHandler(null, null, { noSuffix: true });
    h.parse('cats cat');
    // 'cats' collapses onto base 'cat'
    assert.deepStrictEqual(h.getWords(), ['cat']);
    assert.strictEqual(h.getCounts().cat, 2);
});

test('groupWordsByBase groups suffix variants and sums counts', () => {
    const result = groupWordsByBase(['cat', 'cats'], { cat: 2, cats: 1 });
    assert.deepStrictEqual(result, [{ word: 'cat,cats', count: 3 }]);
});

test('groupWordsByBase merges three or more variants of the same base', () => {
    const result = groupWordsByBase(
        ['cat', 'cated', 'cats'],
        { cat: 1, cated: 1, cats: 1 }
    );
    assert.deepStrictEqual(result, [{ word: 'cat,cated,cats', count: 3 }]);
});

test('groupWordsByBase does not crash when the first sorted word is a suffixed form', () => {
    // regression: previously threw on `last.startsWith` because `last` was undefined
    const result = groupWordsByBase(['aced'], { aced: 1 });
    assert.deepStrictEqual(result, [{ word: 'aced', count: 1 }]);
});

// test('groupWordsByBase merges -s/-ing variants onto the base word (silent-e cases)', () => {
//     // regression: blind suffix stripping split `care`/`cares`/`caring` into
//     // `care` (base 'care') vs `cares`,`caring` (base 'car'), so they never joined
//     assert.deepStrictEqual(
//         groupWordsByBase(['care', 'cares', 'caring', 'cared'],
//             { care: 1, cares: 1, caring: 1, cared: 1 }),
//         [{ word: 'care,cared,cares,caring', count: 4 }]
//     );
//     assert.deepStrictEqual(
//         groupWordsByBase(['say', 'says', 'saying'], { say: 1, says: 1, saying: 1 }),
//         [{ word: 'say,saying,says', count: 3 }]
//     );
// });

// test('groupWordsByBase groups -e lemmas with their inflections via the shared stem', () => {
//     // care/cared/cares/caring all reduce to the stem `car`; use/uses/using to `us`
//     assert.deepStrictEqual(
//         groupWordsByBase(['use', 'uses', 'using'], { use: 1, uses: 1, using: 1 }),
//         [{ word: 'use,uses,using', count: 3 }]
//     );
// });

test('groupWordsByBase merges an -ies plural onto its -y base', () => {
    // exercises the ies→y rule: `flies` stems to `fly`
    const result = groupWordsByBase(['fly', 'flies'], { fly: 2, flies: 1 });
    assert.deepStrictEqual(result, [{ word: 'flies,fly', count: 3 }]);
});

test('groupWordsByBase keeps unrelated words separate', () => {
    const result = groupWordsByBase(['apple', 'dog'], { apple: 1, dog: 2 });
    assert.deepStrictEqual(result, [
        { word: 'apple', count: 1 },
        { word: 'dog', count: 2 }
    ]);
});
