/*
 * analize text from URL and save to json
 * {url, words:{word: count}}
 * @todo add epub, html
 */
const axios = require('axios'),
    path = require('path'),
    fs = require('fs'),
    {WordsHandler} = require('./words'),

    URL = process.argv[(process.argv.indexOf('--url')+1)||-1],
    SAVE = process.argv[(process.argv.indexOf('--save')+1)||-1];

//---------------------------

console.log('check url', URL);

async function main() {
    const text = await query(URL),
        words = new WordsHandler(0,0,{noSuffix: true});
    
    words.parse(text)
        .sort();
    
    const
        // read 5000
        w5000Text = await loadText(path.join(__dirname,'../static/10000.txt')),
        w5000 = w5000Text.split(/[\n\r]+/g).map(word=>word.trim().toLowerCase()),
        
        counts = words.exportCounts(),
        info = {
            url: URL,
            fileSize: text.length, 
            wordsCount: words.getCount(),
            vocabulary: words.getWords().length,
            'index-85': words.getIndex(0.85),
            'absIndex-85': words.getIndex(0.85, w5000),
            'index-90': words.getIndex(0.9),
            'absIndex-90': words.getIndex(0.9, w5000)
        };

    console.log(JSON.stringify(info, 0, '\t'));

    await saveJson(
        path.join(process.env.PWD, SAVE),
        Object.assign(info, {
            words: counts // {word:count, ...}
        })
    );
    
    console.log('saved to', path.join(process.env.PWD, SAVE));
    return;
}

function loadText(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            
            resolve(data);
        });
    });
}

async function loadJson(file) {
    const data = await loadText(file);
    return JSON.parse(data);
}

function saveJson(file, data) {
    return new Promise((resolve,reject)=>{
        fs.writeFile(
            file,
            JSON.stringify(data, 0, '\t'),
            'utf8',
            err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}


async function query(url) {
    const res = await axios.get(url);
    return res.data;
}

main()
 .then(result => {
    if (result) console.log(result);
  })
  .catch(error => {
    console.log(error);
  });
