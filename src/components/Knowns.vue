<template>
    <div>
        <h1>Knowns:</h1>
        <button v-on:click="seen=!seen">show/hide</button> </td>
        <table v-if="seen">
            <tr v-for="word in words">
                <td>{{word}}</td>
                <td><button v-on:click="remove(word)">revert</button></td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    name: 'Knowns',
    data () {
        this.init();
        return {
            seen: false,
            original: [],
            words: []
        }
    },

    methods: {
        init: function() {
            get('static/knowns.list', data => {
                this.words = data.split(/[\n\r]+/);
                this.original = this.words.slice();
                this.localLoad();
                //console.log('loaded knowns: ', this.words.length );
            });
        },
        addWord: function(word) {
            var w = this.words.indexOf(word);
            if (w<0) this.words.push(word);
            this.localSave();
        },
        delWord: function(word) {
            var w = this.words.indexOf(word);
            if (w>=0) this.words.splice(w, 1);
            this.localSave();
        },
        localSave: function() {
            var toAdd = [];
            var toDel = [];
            this.words.forEach(word=>{
                if (this.original.indexOf(word)<0)
                    toAdd.push(word);
            });

            this.original.forEach(word=>{
                if (this.words.indexOf(word)<0)
                    toDel.push(word);
            });

            localStorage.setItem('add-knowns',  toAdd.join(';'));
            localStorage.setItem('del-knowns',  toDel.join(';'));
        },
        localLoad: function() {
            (localStorage.getItem('add-knowns')||'').split(';').forEach(word=>{
                if (this.words.indexOf(word)<0) {
                    this.words.push(word);
                    //console.log('loaded', word);
                }
            });
            (localStorage.getItem('del-knowns')||'').split(';').forEach(word=>{
                var index = this.words.indexOf(word);
                if (index>=0) this.words.splice(index,1);
                
            });
        }
    }
}

function get(url, cb_data) {
    var req = new XMLHttpRequest();
    if (cb_data) 
        req.onreadystatechange = function(){
            if (req.readyState == 4)
                cb_data(req.status == 200? req.responseText: '');
        }
    req.open('GET', url); 
    req.send(null);
}
</script>

<style scoped>

</style>
