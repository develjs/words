<template>
    <div>
        <h1>Founded words:</h1>
        <table>
            <tr v-for="word in words">
                <td>{{ word }}</td>
                <td>{{ counts[word] ||1 }}</td>
                <td><button v-on:click="addKnown(word)">Known</button>
                    <!--button v-on:click="addAlias(word)">Alias</button--> </td>
            </tr>
        </table>
        <Knowns ref="knowns"/>
    </div>
</template>

<script>
import Knowns from './Knowns.vue'

export default {
    name: 'WordsList',
    data () {
        return {
            words: [
                // [word1, word2]
            ],
            counts: {
                // word: count
            },
            cross: [

            ]
        }
    },
    components:{
        'Knowns': Knowns
    },
    methods: {
        addKnown: function(word) {
            this.$refs.knowns.addWord(word);
            this.words.splice(this.words.indexOf(word) ,1);
            console.log('hide', word);
        },
        addAlias: function(data) {
            console.log('alias', data);
        },
        addWord: function(word) {
            if (!word) return;

            if (this.$refs.knowns.words.indexOf(word)>=0) return;
                
            if (this.words.indexOf(word)>=0) {
                this.counts[word] = (this.counts[word]||1) + 1;
                return;
            }
            this.words.push(word);
        },
        doSort: function() {
            var words = this.words.slice();
            words.sort((a,b) => {
                return (this.counts[b]||1) - (this.counts[a]||1);
            });
            this.words = words;
        }
    }
}
</script>

<style scoped>

</style>
