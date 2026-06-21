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
        <span class="input-field">
            <select v-model="selectedOption" ref="select">
                <option value="">Show all levels</option>
                <option value="A1">Hide until A1</option>
                <option value="A2">Hide until A2</option>
                <option value="B1">Hide until B1</option>
                <option value="B2">Hide until B2</option>
                <option value="C1">Hide until C1</option>
            </select>
            <label>Difficulty Level</label>
        </span>
        <table class="highlight"><tbody>
            <tr v-for="word in words">
                <td>{{ word.word }}</td>
                <td>{{ word.count }}</td>
                <td>{{ level(word) }}</td>
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
            sortCount: true,
            selectedOption: ''
        }
    },
    computed: {
        words: function() {
            return this.$store.getters.getFilteredWords(this.suffix, this.sortCount, this.selectedOption);
        },
        counts: function() {
            return this.$store.state.counts;
        }
    },
    methods: {
        addKnown: function(word) {
            this.$store.commit('addKnown', word);
        },
        level: function(wordObj) {
            const { levelIndex } = wordObj;

            if (levelIndex === -1) {
                return '';
            }

            const { a1, a2, b1, b2, c1 } = this.$store.state.levels;

            const pos = ' (' + (levelIndex + 1) + ')';
            if (levelIndex < a1) return 'A1' + pos;
            else if (levelIndex < a2) return 'A2' + pos;
            else if (levelIndex < b1) return 'B1' + pos;
            else if (levelIndex < b2) return 'B2' + pos;
            else if (levelIndex < c1) return 'C1' + pos;
            else return 'C2' + pos;
        }
    },
    mounted() {
        // Initialize Materialize Select
        const elems = this.$refs.select;
        if (elems) {
            M.FormSelect.init(elems, {});
        }
    }
}
</script>

<style scoped>
.input-field {
    display: inline-block;
    margin-left: 1rem;
    
    .select-wrapper input.select-dropdown {
        font-size: .9rem;
        color: #9e9e9e;
    }

    .dropdown-content li>a, .dropdown-content li>span {
        font-size: .9rem;
        padding: .9rem 1rem;
    }
}
</style>
