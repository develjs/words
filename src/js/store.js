/*
// todo:
- hightlight 1000 popular words
- hightlight 2500? popular words
- pack saved words by suffix
- "don t" == "don't"
- attach google translate
- adopt to phone O
- percent of word
- -ed only for words with more then 3-letters
- connect words phrases
- show context
- minute+minutes
*/
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        words: [], // [word1, word2] - founded words
        counts: {}, // word: count
        original: [],
        knowns: []
    },

    getters: {
        // [{word:'word', count:1}]
        wordsEx: state => {
            return state.words.map(word => {
                return { word, count: state.counts[word]||1 }
            })
        },

        // [{word:'word', count:1}]
        wordsJoinedEx: state => {
            let joined = [];
            let sorted = [...state.words].sort();
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
                word.split(',').forEach(word => count += state.counts[word]||1);
                return { word, count: count||1 }
            })
        }
    },

    mutations: {
        addWord: function(state, word) {
            if (!word) return;
            if (state.knowns.indexOf(word)>=0) return;
                
            if (state.words.indexOf(word)>=0) {
                state.counts[word] = (state.counts[word]||1) + 1;
                return;
            }
            state.words.push(word);
        },

        parseText: function(state, text) {
            text.split(/[\n\r\s]+/).forEach(value => {
                value = removeSymbols(value, ' ').trim().toLowerCase();
                this.commit('addWord', value);
            });
            this.commit('doSort');
        },

        doSort: function(state) {
            var words = state.words.slice();
            words.sort((a,b) => (state.counts[b]||1) - (state.counts[a]||1) );
            state.words = words;
        },

        addKnown(state, word) {
            word.split(',').forEach(word => {
                var w = state.knowns.indexOf(word);
                if (w<0) state.knowns.push(word);
                this.commit('localSave');
    
                state.words.splice(state.words.indexOf(word), 1);
                console.log('hide', word);
            })
        },

        delKnown(state, word) {
            var w = state.knowns.indexOf(word);
            if (w>=0) state.knowns.splice(w, 1);
            this.commit('localSave');
        },

        localSave(state) {
            var toAdd = [];
            var toDel = [];
            state.knowns.forEach(word=>{
                if (state.original.indexOf(word)<0)
                    toAdd.push(word);
            });

            state.original.forEach(word=>{
                if (state.knowns.indexOf(word)<0)
                    toDel.push(word);
            });

            localStorage.setItem('add-knowns',  toAdd.join(';'));
            localStorage.setItem('del-knowns',  toDel.join(';'));
        },

        localLoad(state) {
            (localStorage.getItem('add-knowns')||'').split(';').forEach(word=>{
                if (state.knowns.indexOf(word)<0) {
                    state.knowns.push(word);
                    //console.log('loaded', word);
                }
            });
            (localStorage.getItem('del-knowns')||'').split(';').forEach(word=>{
                var index = state.knowns.indexOf(word);
                if (index>=0) state.knowns.splice(index,1);
            });
        },

        initKnowns(state, list) {
            state.knowns = list;
            state.original = state.knowns.slice();
            this.commit('localLoad');
            //console.log('loaded knowns: ', this.words.length );
        }
    },

    actions: {

    }
});


function removeSymbols (text, joinS) {
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