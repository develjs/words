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
            sortCount: true,
            selectedOption: ''
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

            if (this.selectedOption) {
                const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                    
                const index = allLevels.indexOf(this.selectedOption);
                const validLevels = allLevels.slice(0, index + 1);

                words = words.filter(word => {
                    const level = this.level(word.word);
                    if (level === '') return true; // If no level, include it

                    const found = validLevels
                        .find(l => level.startsWith(l));
                    return !found; // If found, exclude it
                });
            }

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
