<template>
    <div id="app">
        <div id="tabs" class="row">
            <div class="col s12">
            <ul class="tabs">
                <li class="tab col s3"><a class="active" href="#source">Source</a></li>
                <li class="tab col s3"><a href="#words">Words</a></li>
                <li class="tab col s3"><a href="#test4">Test 4</a></li>
            </ul>
            </div>
            <div id="source" class="col s12">
                <Source ref="text" v-on:next="next"/>
            </div>
            <div id="words" class="col s12">
                <WordsList ref="words"/>
            </div>
            <div id="test4" class="col s12">Test 4</div>
        </div>
    </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld'
import Source from './components/Source.vue'
import WordsList from './components/WordsList.vue'

export default {
    name: 'App',
    components: {
        Source,
        WordsList
    },
    methods: {
        next: function(){
            var Words = this.$refs.words;
            var Text = this.$refs.text;

            Text.iterate(function(value) {
                Words.addWord(value);
            });
            Words.doSort();

            console.log("app.next");
        }
    },
    mounted() {
        M.AutoInit();
    }
}



</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
    margin-top: 60px;
}
</style>
