/**
 * 
 */
const TERMINATORS = /[\n\r\s\u2000-\u20FF\+\!"\\\/\(\),\.\:\;’'\<\=\>\?\[\]\{\|\}“”…]+/g;
const WRONG_CHARS = /[\#0123456789\$\%\&\@\*\^_\~]/;
const WRONG_WORDS = ['nbsp','s','ll','re','t','ve','d','m','dr','mr','mrs'];
const SUFFIXES = ['es', 's', 'ed', 'ly', 'ing']; //'ment', 'able', 'ible', 'ness',
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
    
    findIndex(word, noSuffix) {
        let index = this.words.indexOf(word);
        if ((index>=0) || !noSuffix || (word.length<2)) return index;

        for (const suffix of SUFFIXES) {
            // without suffix
            if (word.endsWith(suffix) && (word.length - suffix.length > 1)) {
                const shortWord = word.substr(0, word.length - suffix.length);
                
                index = this.words.indexOf(shortWord);
                if (index>=0) return index;
            }
            
            // with suffix
            const longWord = word + suffix;
            index = this.words.indexOf(longWord);
            if (index >= 0) return index;
        }
        
        return index;
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
        
// get grouped words list (with suffixes and others)
// [{word:'word', count:1}]
const wordsJoinedEx = (words, counts) => {
    let joined = [];
    let sorted = [...words].sort();
    sorted.forEach(word => {
        let base = suffixless(word);
        if (base != word) {
            let last = joined[joined.length-1];
            if (base && last.startsWith(base)) {
                if (suffixing(word).concat(base).indexOf(last)>=0) {
                    joined[joined.length-1] += ',' + word;
                    return;
                };
            }
        }

        joined.push(word);
    });

    return joined.map(word => {
        let count = 0;
        word.split(',').forEach(word => count += counts[word]||1);
        return { word, count: count||1 }
    })
}

function suffixing(word) {
    return SUFFIXES.map(suff => {
        word + suff
    })
}

function suffixless(word) {
    for (let s=0; s<SUFFIXES.length; s++) {
        if (!word.endsWith(SUFFIXES[s])) continue;
        return word.substr(0, word.length - SUFFIXES[s].length);
    }
    return word;
}



module.exports = {WordsHandler, wordsJoinedEx};
