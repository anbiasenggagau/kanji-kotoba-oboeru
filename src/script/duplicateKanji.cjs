const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../public');
const newKanji = require("./new.json")

// Get all from public asset
const result = {}
const hiraganaResult = {}
fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)
        for (const val of data) {
            let key = val.kanji
            if (fileLoc.includes("k_")) {
                key = val.kana
            }

            // Kanji Data
            if (result[key] == undefined) {
                result[key] = [val.id]
            } else {
                result[key].push(val.id)
            }

            // Hiragana Data
            if (!fileLoc.includes("k_")) {
                key = val.hiragana
                if (hiraganaResult[key] == undefined) {
                    hiraganaResult[key] = [val.id]
                } else {
                    hiraganaResult[key].push(val.id)
                }
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

    if (hiraganaResult[key] == undefined) {
        hiraganaResult[key] = [val.id]
    } else {
        hiraganaResult[key].push(val.id)
    }
}

// Filter only duplicate
for (const val in result) {
    if (result[val].length == 1) {
        delete result[val]
    }
}
for (const val in hiraganaResult) {
    if (hiraganaResult[val].length == 1) {
        delete hiraganaResult[val]
    }
}

fs.writeFileSync("./kanjiDuplicate.json", JSON.stringify(result, null, 2))
fs.writeFileSync("./hiraganaDuplicate.json", JSON.stringify(hiraganaResult, null, 2))