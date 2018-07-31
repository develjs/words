import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        original: [],
        knowns: [],
        words: [], // [word1, word2]
        counts: {} // word: count
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
                value = trim(removeSymbols(value, ' ')).toLowerCase();
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
            var w = state.knowns.indexOf(word);
            if (w<0) state.knowns.push(word);
            this.commit('localSave');

            state.words.splice(state.words.indexOf(word) ,1);
            console.log('hide', word);
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

function trim (s) {
    return s.replace(/^\s+/g, '').replace(/\s+$/g, '')
}
