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
import {WordsHandler, wordsEx, groupWordsByBase} from '../../lib/words';
import LEVELS_ANCHORS from '../levels.json';

Vue.use(Vuex);

const  WORDS = [], // [word1, word2] - founded words
        COUNTS = {}, // word: count
        wordsHandler = new WordsHandler(WORDS, COUNTS);

// load 10000.txt
const getList10000 = async () => {
    const res = await fetch('static/10000.txt');
    if (res.ok) {
        const text = await res.text();
        const list = text.split(/\r?\n/).filter(word => word.trim() !== '');
        return list;
    } else {
        console.warn('Failed to load 10000.txt');
        return [];
    }
}

// CEFR rank boundaries { a1, a2, b1, b2, c1 } — anchor words (first word of each level) in 10000.txt
const getLevels = (list10000) => {
    const anchors = LEVELS_ANCHORS;
    // Convert anchor words to indices for fast lookups
    const levelIndices = {};
    for (const key of ['a1', 'a2', 'b1', 'b2', 'c1']) {
        levelIndices[key] = list10000.indexOf(anchors[key]);
    }
    return levelIndices;
}

export const store = new Vuex.Store({
    state: {
        words: WORDS, // [word1, word2] - founded words
        counts: COUNTS, // word: count
        list10000: [], // list of 10000 most popular words
        levels: {}, // CEFR rank boundaries { a1, a2, b1, b2, c1 }, computed from levels.json
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
            return groupWordsByBase(state.words, state.counts);
        },

        // Get level index for a word (handles comma-separated variants)
        getLevelIndex: state => word => {
            const words = word.split(',').map(w => w.trim());
            const list10000 = state.list10000 || [];
            if (list10000.length === 0) {
                return -1;
            }

            const index = Math.min(
                ...words.map(w => list10000.indexOf(w)).filter(i => i !== -1)
            );

            return (index === Infinity || index === -1) ? -1 : index;
        },

        // Filter and sort words by suffix, count, and level
        // Returns [{word, count, levelIndex}, ...]
        getFilteredWords: state => (suffix, sortCount, selectedLevel) => {
            let words;
            if (suffix)
                words = [...groupWordsByBase(state.words, state.counts)];
            else
                words = [...wordsEx(state.words, state.counts)];

            if (sortCount)
                words.sort((a, b) => b.count - a.count);

            // Add levelIndex to each word
            const list10000 = state.list10000 || [];
            const { a1, a2, b1, b2, c1 } = state.levels;

            words = words.map(item => {
                const wordNames = item.word.split(',').map(w => w.trim());
                const index = Math.min(
                    ...wordNames.map(w => list10000.indexOf(w)).filter(i => i !== -1)
                );
                const levelIndex = (index === Infinity || index === -1) ? -1 : index;
                return { ...item, levelIndex };
            });

            // Filter by level
            if (selectedLevel) {
                const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const index = allLevels.indexOf(selectedLevel);
                const validLevels = allLevels.slice(0, index + 1);

                words = words.filter(item => {
                    const { levelIndex } = item;
                    if (levelIndex === -1) return true; // If no level, include it

                    let level;
                    if (levelIndex < a1) level = 'A1';
                    else if (levelIndex < a2) level = 'A2';
                    else if (levelIndex < b1) level = 'B1';
                    else if (levelIndex < b2) level = 'B2';
                    else if (levelIndex < c1) level = 'C1';
                    else level = 'C2';

                    const found = validLevels.find(l => level === l);
                    return !found; // If found, exclude it
                });
            }

            return words;
        }
    },

    mutations: {
        // add word to list except knowns
        addWord: function(state, word) {
            if (!word) return;
            if (state.knowns.indexOf(word)>=0) return;
            
            wordsHandler.add(word);
        },

        doSort: function(_state) {
            wordsHandler.sort();
        },

        addKnown(state, word) {
            word.split(',').forEach(word => {
                var w = state.knowns.indexOf(word);
                if (w<0) state.knowns.push(word);

                wordsHandler.remove(word);
            })
            this.commit('localSave');
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
        },
        setList10000(state, list) {
            state.list10000 = list;
        },
        setLevels(state, levels) {
            state.levels = levels;
        },

        parseText: function(state, text) {
            wordsHandler.parse(text, state.knowns);
            this.commit('doSort');
        }
    },

    actions: {
        parseText: async function(context, text) {
            if (context.state.list10000.length === 0) {
                const list = await getList10000();
                const levels = getLevels(list);
                context.commit('setList10000', list);
                context.commit('setLevels', levels);
            }

            context.commit('parseText', text);
        }
    }
});

