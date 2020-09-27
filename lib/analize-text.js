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
    const text = await query(URL);
    const words = new WordsHandler();
    words.parse(text)
        .sort();
    
    await saveJson(
        path.join(process.env.PWD, SAVE),
        {url: URL, words: words.export()}
    );
    
    console.log('saved to', path.join(process.env.PWD, SAVE));
    return;
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
