/**
 * @todo
 * add localStorage
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
                get('bigband.txt', data => {
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
        var symb2 = ['&nbsp;',"’s"];

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
                console.log('hide', word);
            },
            addAlias: function(data) {
                console.log('alias', data);
            },
            addWord: function(word) {
                if (knowns.words.indexOf[word]>=0)
                    return;
                if (this.words.indexOf(word)>=0) {
                    this.counts[word] = (this.counts[word]||1) + 1;
                    return;
                }
                this.words.push(word);
            },
            doSort: function() {
                console.log('slice')
                var words = this.words.slice();
                console.log('sort')
                words.sort((a,b) => {
                    return (this.counts[b]||1) - (this.counts[a]||1);
                });
                console.log('apply')
                this.words = words;
            }
        }
    });

    var knowns = new Vue({
        el: '#knowns',
        data: {
            words: [
                
            ],
            seen: false
        },
        methods:{
            init: function(){
                get('knowns.list', data => {
                    this.words = data.split(/[\n\r]+/);
                    console.log('loaded knowns: ', this.words.length );
                })
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