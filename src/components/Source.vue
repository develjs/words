<template>
    <div>
        <a v-on:click="next" href="javascript:void(0)" class="waves-effect waves-light btn">Parse =></a><br/>
        <textarea class="materialize-textarea" style="width:90%;" v-model="text" ref="text"></textarea>
    </div>
</template>

<script>

export default {
    name: 'Source',
    data () {
        this.init()
        return {
            text: 'Insert words here'
        }
    },

    methods: {
        init: function() {
            fetch('static/luka.txt').then(res=>res.text())
            .then(data => { // 'bigband.txt'
                this.text = data;
                setTimeout(() => {
                    M.textareaAutoResize(this.$refs.text)
                },1)
            });
        },

        next: function() {
            this.$store.commit('parseText', this.text);
            this.$emit('next');
        }
    }
}

</script>

<style scoped>

</style>
