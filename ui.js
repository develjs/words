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
                list.words = parseWords(this.text);
                console.log("next");
            }
        }
    });
    
    var list = new Vue({
        el: '#list',
        data: {
            words: [
                // {word:'', count}
            ],
            aliases: [

            ]
        },
        methods: {
            hide: function(data){
                console.log('hide', data);
            },
            alias: function(data){
                console.log('alias', data);
            }
        }
    });

    var knowns = new Vue({
        el: '#knowns',
        data: {
            words: [
                
            ]
        },
        methods:{
            init: function(){
                get('knowns.list', data => {
                    this.words = data.split(/[\n\r]+/);
                    console.log('loaded knowns: ', this.words.length );
                })
            }
        }

    })


    source.init();
    knowns.init();

    
    function parseWords(text) {

        var text = source.text;
        var words = [];
        var counts = [];
            
        // append words
        text.split(/[\n\r\s]+/).forEach(function(value) {
            value = trim(removeSymbols(value, ' ')).toLowerCase();

            //if (knowns.words.indexOf(value)>=0) return; // skip knowns

            // append
            var ind = words.indexOf(value);
            if (ind<0) {
                words.push(value);
                counts.push(1);
            }
            else {
                counts[ind] += 1;
            }
        });
        text = '';

        
        // convert to composit
        var composit = [];
        for (var i=0; i<words.length; i++) {
            composit.push({word: words[i], count: counts[i]});
        }
        words = 0;
        counts = 0;

        // sort
        composit.sort(function(a,b) {
            return b.count - a.count;
        });
        
        console.log(composit);

        return composit;
    }



    var symbs = '0123456789!"#$%&\()*+,./:;<=>?[\]^_{|}~“';
    var symb2 = ['&nbsp;'];


    function removeSymbols(text, joinS) {
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
    

    function get(url, cb_data) {
        var req = new XMLHttpRequest();
        if (cb_data) 
            req.onreadystatechange = function(){
                if ((req.readyState == 4) && (req.status == 200)) {
                    cb_data(req.responseText);
                }
            }
        req.open('GET', url); 
        req.send(null);
    }

    
})()