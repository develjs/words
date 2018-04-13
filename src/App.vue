<template>
  <div id="app">
    <Source ref="text" v-on:next="next"/>
    <WordsList ref="words"/>

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
