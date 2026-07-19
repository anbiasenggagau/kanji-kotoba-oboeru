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
            if (key.endsWith("する")) {
                const tmpKey = key.substring(0, key.length - 2)
                if (result[tmpKey] != undefined) {
                    result[tmpKey].push([val.id, key])
                } else {
                    result[tmpKey] = [[val.id, key]]
                }
            }
            else if (result[key] == undefined) {
                result[key] = [[val.id, key]]
            } else {
                result[key].push([val.id, key])
            }

            // Hiragana Data
            if (!fileLoc.includes("k_")) {
                key = val.hiragana
                if (hiraganaResult[key] == undefined) {
                    hiraganaResult[key] = [[val.id, val.kanji]]
                } else {
                    hiraganaResult[key].push([val.id, val.kanji])
                }
            }
        }
    })

// Get proposed new kanji
for (const val of newKanji) {
    if (result[val.kanji] == undefined) {
        result[val.kanji] = [[val.id, val.kanji]]
    } else {
        result[val.kanji].push([val.id, val.kanji])
    }

    if (hiraganaResult[val.kanji] == undefined) {
        hiraganaResult[val.kanji] = [[val.id, val.kanji]]
    } else {
        hiraganaResult[val.kanji].push([val.id, val.kanji])
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