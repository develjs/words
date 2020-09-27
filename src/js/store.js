/*
// todo:
- add absoulte Level estamation for any text - index of words you should know to read this text
- estimate user vocabulary
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
import {WordsHandler, wordsEx, wordsJoinedEx, addWord, removeWord, parseText, doSort} from '../../lib/words';

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
            return wordsEx(state.words, state.counts);
        },

        // [{word:'word', count:1}]
        wordsJoinedEx: state => {
            return wordsJoinedEx(state.words, state.counts);
        }
    },

    mutations: {
        // add word to list except knowns
        addWord: function(state, word) {
            if (!word) return;
            if (state.knowns.indexOf(word)>=0) return;
            
            addWord(word, state.words, state.counts);
        },

        parseText: function(state, text) {
            parseText(text, value => {
                this.commit('addWord', value);
            })
            this.commit('doSort');
        },

        doSort: function(state) {
            doSort(state.words, state.counts);
        },

        addKnown(state, word) {
            word.split(',').forEach(word => {
                var w = state.knowns.indexOf(word);
                if (w<0) state.knowns.push(word);
                this.commit('localSave');
    
                removeWord(word, state.words);
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
