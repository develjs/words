/*
 * analize text from URL and save to json
 * {url, words:{word: count}}
 * @todo 
 * - add link spider
 * - add epub 
 * - return negative or aproximated? index if counts large then dictionary
 * - add statistic like http://englishprofile.org/wordlists/text-inspecto
 * - add word relations https://studynow.ru/5000englishwords/
 */
const axios = require('axios'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    md5 = require('md5.js'),
    {parse} = require('node-html-parser'),
    {readList, loadJson, saveJson} = require('./io-misc'),
    {WordsHandler} = require('./words'),
    
    ETALON = path.join(__dirname,'../static/10000.txt'),
    STAT_DB = path.join(process.env.PWD, 'static/list.json'),
    CACHE_DIR = '.cache';


//---------------------------

async function main() {
    const
        URL = process.argv[(process.argv.indexOf('--url')+1)||-1],
        SAVE = process.argv[(process.argv.indexOf('--save')+1)||-1],
        // read etalon
        etalon = (await readList(ETALON)).map(word=>word.trim().toLowerCase());
    
    console.log('check url', URL);
    const info = await handleUrl(URL, etalon, SAVE);
    console.log(JSON.stringify(info, 0, '\t'));
}

async function handleUrl(artUrl, etalon, saveTo) {
    const
        md5stream = new md5(),
        words = new WordsHandler(0,0,{noSuffix: true});

    await readTextChunks(artUrl, data => {
        words.parse(data);
        md5stream.update(data);
    });

    words.sort();

    const
        hash = md5stream.digest('hex'),

        info = {
            url: artUrl,
            fileSize: words.charsCount,
            hash,
            wordsCount: words.getCount(),
            vocabulary: words.getWords().length,
            'index-85': words.getIndex(0.85),
            'absIndex-85': words.getIndex(0.85, etalon),
            'index-90': words.getIndex(0.9),
            'absIndex-90': words.getIndex(0.9, etalon)
        };

    // save file data
    let save_name = CACHE_DIR + '/' + url.parse(artUrl).hostname + '-' + hash + '.json';
    save_name = path.join(process.env.PWD, saveTo || save_name);
    await saveJson(save_name,
        Object.assign({}, info, {   
            words: words.exportCounts() // {word:count, ...}
        })
    );
    console.log('saved to', save_name);
    
    // save to common db
    let stat = await loadJson(STAT_DB) || {};
    stat[url.parse(artUrl).hostname + '-' + hash] = info;
    await saveJson(STAT_DB, stat);

    return info;
}

async function readTextChunks(location, cb_data) {
    const res = await axios.get(location);
    const type = res.headers['content-type'];
    
    // 'content-type': 'text/plain; charset=utf-8'
    if (type.includes('text/plain')) {
        cb_data(res.data);
    } if (type.includes('text/html')) {
        const root = parse(res.data);
                
        let pars = [...root.querySelectorAll('p')]; //.childNodes[0].rawText;
        if (pars.length) {
            for (const p of pars) {
                const pChildren = [...p.querySelectorAll('p')];
                for (const pChild of pChildren) {
                    p.removeChild(pChild);
                }
                
                cb_data(p.rawText);
            }
        } else {
            console.log('Warning: no paragraphs');
            cb_data(root.rawText);
        }
        
    } else {
        throw new Error('Unknown type:' + type);
    }
}
   

main()
 .then(result => {
    if (result) console.log(result);
  })
  .catch(error => {
    console.log(error);
  });
