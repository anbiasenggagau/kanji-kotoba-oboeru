const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../public');
const newKanji = require("./new.json")

// Get all from public asset
const result = {}
fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)
        for (const val of data) {
            if (result[val.kanji] == undefined) {
                result[val.kanji] = [val.id]
            } else {
                result[val.kanji].push(val.id)
            }
        }
    })

// Get proposed new kanji
for (const val of newKanji) {
    if (result[val.kanji] == undefined) {
        result[val.kanji] = [val.id]
    } else {
        result[val.kanji].push(val.id)
    }
}

// Filter only duplicate
for (const val in result) {
    if (result[val].length == 1) {
        delete result[val]
    }
}

fs.writeFileSync("./duplicateKanji.json", JSON.stringify(result, null, 2))