class WordsHandler {
    constructor() {

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

const SUFFIXES = ['es', 's', 'ed', 'd', 'ly', 'ing'];//'ment', 'able', 'ible',
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

function addWord(word, words, counts) {
    if (!word) return;
    if (words.indexOf(word)>=0) {
        counts[word] = (counts[word]||1) + 1;
        return;
    }
    words.push(word);
}

function removeWord(word, words) {
    words.splice(words.indexOf(word), 1);
}

function removeSymbols(text, joinS) {
    var symbs = '0123456789!"#$%&\()*+,./:;<=>?[\]^_{|}~“”…';
    var symb2 = ['&nbsp;',/’s$/,/’ll$/,/’re$/,/n’t$/,/’ve#$/,/’ll$/,/[\u2000-\u20FF]/];
  
    for (let i=0; i < symb2.length; i++) {
        text = text.split(symb2[i]).join(joinS || '');
    }
    /* var new_text = '';
    for (var i=0; i<text.length; i++)
        if (trueSymb.indexOf(text[i])>=0) new_text += text[i]; */
    
    for (let i=0; i<symbs.length; i++) {
        text = text.split(symbs[i]).join(joinS || '');
    }
    return text;
}

function parseText(text, cb_word) {
    text.split(/[\n\r\s]+/).forEach(value => {
        value = removeSymbols(value, ' ').trim().toLowerCase();
        cb_word(value);
    });
}

function doSort(words, counts) {
    return words.sort((a,b) => (counts[b]||1) - (counts[a]||1) );
}


export {WordsHandler, wordsJoinedEx, wordsEx, removeSymbols, parseText, addWord, removeWord, doSort};
