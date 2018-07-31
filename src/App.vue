<template>
    <div id="app">
        <div id="tabs" class="row">
            <div class="col s12">
            <ul class="tabs">
                <li class="tab col s3"><a v-on:click="showTab='source'" v-bind:class="{active:showTab=='source'}" href="#source">Source</a></li>
                <li class="tab col s3"><a v-on:click="showTab='words'"  v-bind:class="{active:showTab=='words'}"  href="#words">Words</a></li>
                <li class="tab col s3"><a v-on:click="showTab='knowns'" v-bind:class="{active:showTab=='knowns'}" href="#knowns">Knowns</a></li>
            </ul>
            </div>
            <div v-if="showTab=='source'" class="col s12">
                <Source ref="source" v-on:next="activeTab('words')"/>
            </div>
            <div v-if="showTab=='words'" class="col s12">
                <WordsList ref="words"/>
            </div>
            <div v-if="showTab=='knowns'" class="col s12">
                <Knowns/>
            </div>

        </div>
    </div>
</template>

<script>
/*
// todo:
- hightlight selected word
- hightlight 1000 popular words
- hightlight 2500? popular words
- join words with popular suffix: -s, -ed -ly -ment -able -ing...
- "don t" == "don't"
- attach google translate
*/

import Source from './components/Source.vue'
import WordsList from './components/WordsList.vue'
import Knowns from './components/Knowns.vue'

export default {
    name: 'App',
    components: {
        Source,
        WordsList,
        Knowns
    },
    data () {
        return {
            showTab: 'source'
        }
    },
    methods: {
        // handing active tab
        activeTab: function(name) {
            this.showTab = name;
            M.Tabs.getInstance(document.querySelector('.tabs')).select(name);
        }
    },
    mounted() {
        M.AutoInit();
    },
    created(){
        fetch('static/knowns.list').then(res=>res.text())
        .then(data => {
            this.$store.commit('initKnowns', data.split(/[\n\r]+/));
        });
        
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
