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
        }
    }
}
</script>

<style scoped>

</style>
