<template>
    <div>
        <!-- Switch -->
        <span class="switch">
            <label>
                <input type="checkbox" v-model="suffix">
                <span class="lever"></span>
                Consider a suffix
            </label>
        </span>
        <span class="switch">
            <label>
                <input type="checkbox" v-model="sortCount">
                <span class="lever"></span>
                Sort by count
            </label>
        </span>
        <table class="highlight"><tbody>
            <tr v-for="word in words">
                <td>{{ word.word }}</td>
                <td>{{ word.count }}</td>
                <td>{{ level(word.word) }}</td>
                <td><button v-on:click="addKnown(word.word)" class="waves-effect waves-light btn">Known</button>
                    <!--button v-on:click="addAlias(word.word)">Alias</button--> </td>
            </tr>
        </tbody></table>
    </div>
</template>

<script>


export default {
    name: 'WordsList',
    data () {
        return { 
            suffix: true,
            sortCount: true
        }
    },
    computed: {
        words: function() {
            let words;
            if (this.suffix)
                words = [...this.$store.getters.wordsJoinedEx];
            else
                words = [...this.$store.getters.wordsEx];

            if (this.sortCount)
                words.sort((a,b) => b.count - a.count)

            return words;
        },
        counts: function() {
            return this.$store.state.counts;
        }
    },
    methods: {
        addKnown: function(word) {
            this.$store.commit('addKnown', word);
        },
        level: function(word) {
            const words = word.split(',').map(w => w.trim());

            const list10000 = this.$store.state.list10000 || [];
            if (list10000.length === 0) {
                return '';
            }

            const index = Math.min(
                ...words.map(w => list10000.indexOf(w)).filter(i => i !== -1)
            );

            if (index === Infinity || index === -1) {
                return '';
            } else if (index < 1000) {
                return 'A1 (' + (index + 1) + ')';
            } else if (index < 2500) {
                return 'A2 (' + (index + 1) + ')';
            } else if (index < 3500) {
                return 'B1 (' + (index + 1) + ')';
            } else if (index < 5000) {
                return 'B2 (' + (index + 1) + ')';
            } else if (index < 7500) {
                return 'C1 (' + (index + 1) + ')';
            } else {
                return 'C2 (' + (index + 1) + ')';
            }
        }
    }
}
</script>

<style scoped>

</style>
