/**
 * 
 */
const TERMINATORS = /[\n\r\s\u2000-\u20FF\+\!"\\\/\(\),\.\:\;’'\<\=\>\?\[\]\{\|\}“”…]+/g;
const WRONG_CHARS = /[\#0123456789\$\%\&\@\*\^_\~]/;
const WRONG_WORDS = ['nbsp','s','ll','re','t','ve','d','m','dr','mr','mrs'];
class WordsHandler {
    constructor(words, counts) {
        this.words = words || [];
        this.counts = counts || {};
    }
    
    getWords() {
        return this.words;
    }
    
    getCounts() {
        return this.counts;
    }
    
    add(word) {
        if (!word || WRONG_WORDS.includes(word) || WRONG_CHARS.test(word)) return this;
        
        if (this.words.indexOf(word)>=0) {
            this.counts[word] = (this.counts[word]||1) + 1;
            return this;
        }
        this.words.push(word);
        
        return this;
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
        word = word.trim().toLowerCase();

        return word;
    }

    parse(text, skipList) {
        text.split(TERMINATORS)
        .forEach(value => {
            value = this.normalize(value);
            if (skipList && skipList.includes(value)) return;
            
            this.add(value);
        });
        
        return this;
    }
    
    sort() {
        this.words.sort((a,b) => (this.counts[b]||1) - (this.counts[a]||1) );

        return this;
    }
    
    export() {
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

const SUFFIXES = ['es', 's', 'ed', 'd', 'ly', 'ing']; //'ment', 'able', 'ible',
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



module.exports = {WordsHandler, wordsJoinedEx, wordsEx};
