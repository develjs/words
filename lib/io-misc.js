const
    path = require('path'),
    fs = require('fs');

async function readList(path) {
    const text = await loadText(path);
    return text.split(/[\n\r]+/g);
};

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

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

async function loadJson(file) {
    try {
        const data = await loadText(file);
        return JSON.parse(data);    
    } catch(e) {
        return null
    }
}

function saveJson(file, data) {
    return new Promise((resolve,reject)=>{
        ensureDirectoryExistence(file);

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


module.exports = {
    readList,
    loadText,
    loadJson,
    saveJson,
    ensureDirectoryExistence    
}
