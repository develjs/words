(function(){
    var src_text = document.getElementsByTagName('textarea')[0];
    var table = document.getElementsByTagName('table')[0];
    
    var knowns = [];
    
    var trueSymb = 'abcdefghijklmnopqrstuvwxwz\'';
    var symbs = '0123456789!"#$%&\()*+,./:;<=>?[\]^_{|}~“';
    var symb2 = ['&nbsp;'];


    function start() {
        var text = src_text.innerHTML;
        var words = [];
        var counts = [];
            
        // append words
        text.split(/[\n\r\s]+/).forEach(function(value) {
            value = trim(removeSymbols(value, ' ')).toLowerCase();

            if (knowns.indexOf(value)>=0) return; // skip nowns

            // append
            var ind = words.indexOf(value);
            if (ind<0){
                words.push(value);
                counts.push(1);
            }
            else {
                counts[ind] += 1;
            }
        });
        text = '';

        
        // convert to composit
        window.composit = [];
        for (var i=0; i<words.length; i++) {
            composit.push({word: words[i], count: counts[i]});
        }
        words = 0;
        counts = 0;

        // sort
        composit.sort(function(a,b) {
            return b.count - a.count;
        })
        
        console.log(composit);

        // fill table
        for (var i=0; i<composit.length; i++){
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + composit[i].word + '</td><td>' + composit[i].count + '</td>';
            table.appendChild(row);
        }

    }

    
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
    
    
    get('luka.txt', function(data) {
        src_text.innerHTML = data;

        get('knowns.list', function(data) {
            knowns = data.split(/[\n\r]+/);
            console.log(knowns)
            start();
        })
    }) 

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

})();
