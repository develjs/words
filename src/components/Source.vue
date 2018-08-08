<template>
    <div>
        <p>
            Paste your one text below or select one of presets:
            <span v-for="preset in presets">
                <a href="javascript:void(0)" v-on:click="loadPreset(preset)" class="">{{preset.split('/').pop().replace('.txt','')}}</a>&nbsp;
            </span>
        </p>
        <a v-on:click="next" href="javascript:void(0)" class="waves-effect waves-light btn">Parse =></a><br/>
        <textarea class="materialize-textarea" style="width:90%;" v-model="text" ref="text" placeholder="Insert a text here"></textarea>
    </div>
</template>

<script>

export default {
    name: 'Source',
    data () {
        this.init()
        return {
            presets:['static/luka.txt', 'static/bigband.txt'],
            text: ''
        }
    },

    methods: {
        init() {
            
        },
        next() {
            this.$store.commit('parseText', this.text);
            this.$emit('next');
        },
        loadPreset(preset) {
            fetch(preset).then(res=>res.text())
            .then(data => { // 'bigband.txt'
                this.text = data;
                setTimeout(() => {
                    M.textareaAutoResize(this.$refs.text)
                },1)
            });
        }
    }
}

</script>

<style scoped>

</style>
