/*
 * analize text from URL and save to json
 * {url, words:{word: count}}
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
        words = new WordsHandler();
    
    words.parse(text)
        .sort();
    
    const counts = words.export(),
        index = await textIndex(counts);
    
    await saveJson(
        path.join(process.env.PWD, SAVE),
        {url: URL, index, words: counts}
    );
    
    console.log('saved to', path.join(process.env.PWD, SAVE));
    return;
}

// words - after WordsHandler
async function textIndex(words) {
    const THRESHOLD = 0.9;
    // read 5000
    const w5000Text = await loadText(path.join(__dirname,'../static/10000.txt')),
        w5000 = w5000Text.split(/[\n\r]+/);
    
    let wordsCount = 0;
    for (const w in words) wordsCount += words[w];
    
    let count = 0,
        i;
    for (i=0; i<w5000.length; i++) {
        const word = w5000[i].trim().toLowerCase();
        count += words[word] || 0;
        if (count/wordsCount > THRESHOLD) break;
    }
    console.log(count + '/' + wordsCount);
    return i;
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
