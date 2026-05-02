const fs = require('fs');
const path = require('path');

const hiragana = "ーッアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポキャキュキョギャギュギョニャニュニョヒャヒュヒョビャビュビョピャピュピョミャミュミョリャリュリョジャジュジェジョチャチュチェチョシャシュシェショあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽきゃきゅきょぎゃぎゅぎょにゃにゅにょひゃひゅひょびゃびゅびょぴゃぴゅぴょみゃみゅみょりゃりゅりょじゃじゅじぇじょちゃちゅちぇちょしゃしゅしぇしょ～"

const publicDir = path.join(__dirname, '../../public');

const result = {}
const kanjiByLetter = {}
fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)

        for (const val of data) {
            let key = "kanji"
            if (fileLoc.includes("k_")) {
                key = "kana"
            }

            const kanjiLength = (val[key].length).toString()
            if (kanjiByLetter[kanjiLength]) {
                kanjiByLetter[kanjiLength].push(val[key])
            } else {
                kanjiByLetter[kanjiLength] = [val[key]]
            }

            for (const char of val[key]) {
                if (hiragana.includes(char)) {
                    continue
                }
                if (result[char]) {
                    result[char].amount++
                    result[char].words.push(val[key])
                } else {
                    result[char] = {
                        amount: 1,
                        words: [val[key]]
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

fs.writeFileSync("./kanjiLength.json", JSON.stringify(kanjiByLetter, null, 2))
fs.writeFileSync("./kanjiUnique.json", JSON.stringify(sorted, null, 2))
fs.writeFileSync("./kanjiArr.json", JSON.stringify(kanjiArr, null, 2))