<template>
    <div>
        <table class="highlight"><tbody>
            <tr v-for="word in userAdded" :key="'u-' + word">
                <td>{{word}}</td>
                <td>
                    <button v-on:click="remove(word)" class="waves-effect waves-light btn">revert</button>
                </td>
            </tr>
            <tr v-for="word in standard" :key="'s-' + word" class="standard">
                <td>{{word}}</td>
                <td></td>
            </tr>
        </tbody></table>
    </div>
</template>

<script>
export default {
    name: 'Knowns',
    computed: {
        // words the user added themselves — present in knowns but not in the standard list
        userAdded: function() {
            const original = new Set(this.$store.state.original);
            return this.$store.state.knowns.filter(word => !original.has(word));
        },
        // standard list words still active — shown greyed at the bottom, not revertable
        standard: function() {
            const original = new Set(this.$store.state.original);
            return this.$store.state.knowns.filter(word => original.has(word));
        }
    },

    methods: {
        remove(word) {
            this.$store.commit('delKnown', word);
        }
    }
}


</script>

<style scoped>
.standard td {
    color: #9e9e9e;
}
</style>
