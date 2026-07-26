const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, '../../../public');

let kanji = []

fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        const fileLoc = publicDir + "/" + file;
        let data = require(fileLoc);
        kanji.push(data);
    });

for (const [idx, val] of kanji.entries()) {
    for (const [idx2, val2] of val.entries()) {
        const num = val2.id.split(".")
        num[0] = kanji[idx][0].id.split(".")[0]
        num[1] = kanji[idx][0].id.split(".")[1]
        num[2] = idx2 + 1
        kanji[idx][idx2].id = num.join(".")
    }
    const num = kanji[idx][0].id.split(".")
    const fileName = `../../../public/${num[0].at(-1)}_${num[1]}.json`
    fs.writeFileSync(fileName, JSON.stringify(kanji[idx], null, 2))
}