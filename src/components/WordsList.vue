<template>
    <div>
        <table>
            <tr v-for="word in words">
                <td>{{ word }}</td>
                <td>{{ counts[word] ||1 }}</td>
                <td><button v-on:click="addKnown(word)" class="waves-effect waves-light btn">Known</button>
                    <!--button v-on:click="addAlias(word)">Alias</button--> </td>
            </tr>
        </table>
    </div>
</template>

<script>


export default {
    name: 'WordsList',
    data () {
        return { }
    },
    computed: {
        words: function() {
            return this.$store.state.words;
        },
        counts: function() {
            return this.$store.state.counts;
        }
    },
    methods: {
        addKnown: function(word) {
            this.$store.commit('addKnown', word);
        },
        addWord: function(word) {
            this.$store.commit('addWord', word);
        }
    }
}
</script>

<style scoped>

</style>
