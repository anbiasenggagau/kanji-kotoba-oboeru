const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, '../../public');
const newKanji = require("./tempData.json")

let currKanji = []
let result = []
fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)
        currKanji.push(data)
    })
currKanji = currKanji.flat()

for (const kanji of newKanji) {
    if (currKanji.find(val => val.kanji == kanji) == undefined) {
        result.push(kanji)
    }
}

fs.writeFileSync("./tempDataFilter.json", JSON.stringify(result))