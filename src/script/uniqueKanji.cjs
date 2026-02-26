const fs = require('fs');
const path = require('path');

const hiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼきゃきゅきょぎゃぎゅぎょにゃにゅにょひゃひゅひょびゃびゅびょぴゃぴゅぴょみゃみゅみょりゃりゅりょじゃじゅじぇじょちゃちゅちぇちょしゃしゅしぇしょ～"

const publicDir = path.join(__dirname, '../../public');

const result = {}
fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)
        for (const val of data) {
            for (const char of val.kanji) {
                if (hiragana.includes(char)) {
                    continue
                }
                if (result[char]) {
                    result[char].amount++
                    result[char].words.push(val.kanji)
                } else {
                    result[char] = {
                        amount: 1,
                        words: [val.kanji]
                    }
                }
            }
        }
    });

const sorted = Object.entries(result)
    .sort((a, b) => b[1].amount - a[1].amount)

const kanjiArr = []
for (const val of sorted) {
    kanjiArr.push(val[0])
}

fs.writeFileSync("./uniqueKanji.json", JSON.stringify(sorted, null, 2))
fs.writeFileSync("./kanjiArr.json", JSON.stringify(kanjiArr, null, 2))