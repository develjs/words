<template>
    <div>
        <h1>Sources:</h1>
        <textarea v-model="text"></textarea>
        <button v-on:click="next">Parse</button>
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
            get('static/luka.txt', data => { // 'bigband.txt'
                this.text = data;
            });
        },

        next: function() {
            this.$emit('next');
            /* this.text.split(/[\n\r\s]+/).forEach(function(value) {
                value = trim(removeSymbols(value, ' ')).toLowerCase();
                WordsList.addWord(value);
            });
            WordsList.doSort();*/
            
            //console.log("next");
        },

        iterate: function (cbWord) {
            this.text.split(/[\n\r\s]+/).forEach(function (value) {
                value = trim(removeSymbols(value, ' ')).toLowerCase();
                cbWord(value);
            });
        }
    }
}

function removeSymbols (text, joinS) {
    var symbs = '0123456789!"#$%&\()*+,./:;<=>?[\]^_{|}~“”…';
    var symb2 = ['&nbsp;',/’s$/,/’ll$/,/’re$/,/n’t$/,/’ve#$/,/’ll$/,/[\u2000-\u20FF]/];
  
    for (let i=0; i < symb2.length; i++) {
        text = text.split(symb2[i]).join(joinS || '');
    }
    /* var new_text = '';
    for (var i=0; i<text.length; i++)
        if (trueSymb.indexOf(text[i])>=0) new_text += text[i]; */
    
    for (let i=0; i<symbs.length; i++) {
        text = text.split(symbs[i]).join(joinS || '');
    }
    return text;
}

function trim (s) {
    return s.replace(/^\s+/g, '').replace(/\s+$/g, '')
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
