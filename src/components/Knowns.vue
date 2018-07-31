<template>
    <div>
        <table>
            <tr v-for="word in knowns">
                <td>{{word}}</td>
                <td>
                    <button v-on:click="remove(word)" class="waves-effect waves-light btn">revert</button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    name: 'Knowns',
    computed: {
        knowns: function() {
            return this.$store.state.knowns;
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

</style>
