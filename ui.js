/**
 * @todo
 * add crosswords
 * add http
 */
(function(){
    var source = new Vue({
        el: '#source',
        data: {
            text: 'Insert words here'
        },
        methods: {
            init: function() {
                get('luka.txt', data => { // 'bigband.txt'
                    this.text = data;
                });
            },
            next: function() {
                this.text.split(/[\n\r\s]+/).forEach(function(value) {
                    value = trim(removeSymbols(value, ' ')).toLowerCase();
                    list.addWord(value);
                });
                list.doSort();
                
                console.log("next");
            },
            iterate: function(cb_word){
                this.text.split(/[\n\r\s]+/).forEach(function(value) {
                    value = trim(removeSymbols(value, ' ')).toLowerCase();
                    cb_word(value);
                });
            }
        }
    });

    function removeSymbols(text, joinS) {
        var symbs = '0123456789!"#$%&\()*+,./:;<=>?[\]^_{|}~“”…';
        var symb2 = ['&nbsp;',/’s$/,/’ll$/,/’re$/,/n’t$/,/’ve#$/,/’ll$/,/[\u2000-\u20FF]/];

        for (var i=0; i<symb2.length; i++)
            text = text.split(symb2[i]).join(joinS||'');

        /*var new_text = '';
        for (var i=0; i<text.length; i++)
            if (trueSymb.indexOf(text[i])>=0) new_text += text[i];*/
        
        for (var i=0; i<symbs.length; i++)
            text = text.split(symbs[i]).join(joinS||'');
        return text;
    }

    function trim(s) {
        return s.replace(/^\s+/g,'').replace(/\s+$/g,'');
    }

    
    var list = new Vue({
        el: '#list',
        data: {
            words: [
                // [word1, word2]
            ],
            counts: {
                // word: count
            },
            cross: [

            ]
        },
        methods: {
            addKnown: function(word) {
                knowns.addWord(word);
                this.words.splice(this.words.indexOf(word) ,1);
                console.log('hide', word);
            },
            addAlias: function(data) {
                console.log('alias', data);
            },
            addWord: function(word) {
                if (!word) return;

                if (knowns.words.indexOf(word)>=0) return;
                    
                if (this.words.indexOf(word)>=0) {
                    this.counts[word] = (this.counts[word]||1) + 1;
                    return;
                }
                this.words.push(word);
            },
            doSort: function() {
                var words = this.words.slice();
                words.sort((a,b) => {
                    return (this.counts[b]||1) - (this.counts[a]||1);
                });
                this.words = words;
            }
        }
    });


    // default knowns - knowns.list
    // added > add-knowns
    // removed > removed-knowns
    var knowns = new Vue({
        el: '#knowns',
        data: {
            seen: false,
            original: [],
            words: []
        },
        methods: {
            init: function() {
                get('knowns.list', data => {
                    this.words = data.split(/[\n\r]+/);
                    this.original = this.words.slice();
                    this.localLoad();
                    console.log('loaded knowns: ', this.words.length );
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
                        console.log('loaded', word);
                    }
                });
                (localStorage.getItem('del-knowns')||'').split(';').forEach(word=>{
                    var index = this.words.indexOf(word);
                    if (index>=0) this.words.splice(index,1);
                    
                });
            }
        }
    });


    source.init();
    knowns.init();

    
    

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

    
})()