/**
 * Module for handling words and their counts, including normalization, stemming, and grouping by base forms.
 */
const TERMINATORS = /[\n\r\s\u2000-\u20FF\+\!"\\\/\(\),\.\:\;’'\<\=\>\?\[\]\{\|\}“”…]+/g;
const WRONG_CHARS = /[\#0123456789\$\%\&\@\*\^_\~]/;
const WRONG_WORDS = ['nbsp','s','ll','re','t','ve','d','m','dr','mr','mrs'];

// Define suffixes (longer/more specific first!)
const ENGLISH_RULES = [
  { suffix: "ies", replacement: "y" },   // flies → fly
  { suffix: "es",  replacement: "" },
  { suffix: "s",   replacement: "" },
  { suffix: "ing", replacement: "" },
  { suffix: "ed",  replacement: "" },
  { suffix: "er",  replacement: "" },
  { suffix: "est", replacement: "" },
  { suffix: "ly",  replacement: "" },
  // "n't", "'s",
];

class WordsHandler {
    constructor(words, counts, options = {}) {
        this.words = words || [];
        this.counts = counts || {};
        this.count = 0; // all words count
        this.charsCount = 0;
        this.noSuffix = options.noSuffix; // cut a suffix
    }
    
    // ['word']
    getWords() {
        return this.words;
    }
    
    // {'word': Number} only if Number > 1
    getCounts() {
        return this.counts;
    }
    
    getCount(){
        return this.count;
    }
    
    // @param {float} threshold
    // @param {String[]} etalon
    getIndex(threshold, etalon) {
        let words = etalon;
        if (!words) {
            words = [...this.words];
            words.sort((a,b) => (this.counts[b] || 0) - (this.counts[a] || 0));
        }
        
        const wordCash = [];
        let i = 0, weight = 0;
        for (; i<words.length; i++) {
            let word = words[i]; // get word

            if (etalon && this.noSuffix) {
                const index = this.findIndex(word, this.noSuffix); // index in the dictionary
                if (index < 0) {
                    // console.log('skip', words[i]);
                    continue;
                }
                
                word = this.words[index]; // get word
            }
            
            const count = this.counts[word];
            if (!count) {
                // console.log('skip2', words[i]);
                continue;
            }

            if (wordCash.includes(word)) {
                // console.log('skip3', words[i]);
                continue;
            }

            wordCash.push(word);
            
            // console.log('push', i, word, this.counts[word]);    
            weight += this.counts[word] || 0;
            if (weight/this.count > threshold) break;
        }
        
        console.log(weight + '/' + this.count + '=' + weight/this.count + ', index=' + i);
        if (weight/this.count < threshold) return NaN;
        return i;
    }
    
    add(newWord) {
        if (!newWord || WRONG_WORDS.includes(newWord) || WRONG_CHARS.test(newWord)) return this;
        
        let index = this.findIndex(newWord, this.noSuffix),
            word = index<0? newWord: this.words[index];
        
        if (word.length > newWord.length) {
            this.replace(index, newWord);
            word = newWord;
        }
        
        if (index<0) this.words.push(word);
        this.counts[word] = (this.counts[word] || 0) + 1;
        this.count++;

        return this;
    }
    
    // replace old word in index by new one
    replace(index, newWord) {
        const word = this.words[index];
        this.words[index] = newWord;
        this.counts[newWord] = this.counts[word];
        delete this.counts[word];
    }
    
    findIndex(word, noSuffix = false) {
        let index = this.words.indexOf(word);
        if (index >= 0) return index;

        if (!noSuffix || !word || word.length < 2) {
            return -1;
        }

        const base = getBase(word, ENGLISH_RULES);

        for (let i = 0; i < this.words.length; i++) {
            if (getBase(this.words[i], ENGLISH_RULES) === base) {
            return i;
            }
        }

        return -1;
    }
    
    remove(word) {
        const index = this.words.indexOf(word);
        if (index < 0) return this;
        
        this.words.splice(index, 1);
        if (this.counts[word]) delete this.counts[word];

        return this;
    }
    
    normalize(word) {
        word = word.replace(TERMINATORS,' ');
        word = word
            .trim()
            .toLowerCase()
            .replace(/^[-]+|[-]+$/g, '');

        return word;
    }

    // add text to current state
    parse(text, skipList) {
        text.split(TERMINATORS)
        .forEach(value => {
            value = this.normalize(value);
            if (!value || (skipList && skipList.includes(value))) return;
            
            this.add(value);
        });
        this.charsCount += text.length;
        
        return this;
    }
    
    sort() {
        this.words.sort((a,b) => (this.counts[b]||0) - (this.counts[a]||0) );

        return this;
    }
    
    // return {'word': Number}
    exportCounts() {
        return this.words.reduce((acc, word)=>{
            acc[word] = this.counts[word] || 1;
            return acc;
        }, {});
    }
}

// simple
// [{word:'word', count:1}] 
const wordsEx = (words, counts) => {
    return words.map(word => {
        return { word, count: counts[word]||1 }
    })
}

/**
 * Group words by base 
 * @param {string[]} words
 * @param {Object} counts - { "word": count }
 * @param {Array<{suffix: string, replacement?: string}>} rules - optional custom rules for stemming
 * @param {number} minStemLength - minimum length for the stem after removing suffix (default: 3)
 * @returns {Array<{word: string, count: number}>} - array of objects with joined words and their total counts
 */
const groupWordsByBase = (words, counts = {}, rules = ENGLISH_RULES, minStemLength = 3) => {
  const groups = new Map();

  for (const word of new Set(words)) {
    const base = getBase(word, rules, minStemLength);

    if (!groups.has(base)) {
      groups.set(base, []);
    }
    groups.get(base).push(word);
  }

  return Array.from(groups.values()).map(wordList => {
    // sort for predefined order
    const sorted = wordList.sort((a, b) => a.localeCompare(b));
    const joinedWord = sorted.join(",");

    let totalCount = 0;
    for (const w of sorted) {
      totalCount += counts[w] || 1;
    }

    return {
      word: joinedWord,
      count: totalCount
    };
  });
}

function getBase(word, rules, minStemLength = 3) {
  let base = word.toLowerCase();

  for (const rule of rules) {
    if (base.endsWith(rule.suffix)) {
      const newBase = base.slice(0, -rule.suffix.length) + (rule.replacement || '');
      if (newBase.length >= minStemLength) {
        return newBase;
      }
    }
  }
  return base;
}


export {WordsHandler, wordsEx, groupWordsByBase};
