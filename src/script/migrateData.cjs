const fs = require('fs');
const path = require('path');
const migrateId = require("./archive.json")
const replacement = require("./new.json")
const replaced = require("./newTemp.json")

const publicDir = path.join(__dirname, '../../public');

main2()

function main2() {
    /**
 * @typedef {Object} Vocabulary
 * @property {string} id
 * @property {string} kanji
 * @property {string} component
 * @property {string} hiragana
 * @property {string} enMeaning
 * @property {string} idMeaning
 * @property {"Kata Benda" | "Kata Sifat な" | "Kata Sifat い" | "KK Transitif" | "KK Intransitif" | "Frasa / Klausa"} type
 */

    /** @type {Record<string, Vocabulary[]>} */
    const kanjiData = {}

    fs.readdirSync(publicDir)
        .filter(file => path.extname(file) === '.json' && file[0] == "4")
        .forEach(file => {
            fileLoc = publicDir + "/" + file
            let data = require(fileLoc)
            kanjiData[file] = data
        })

    for (const key in kanjiData) {
        for (let i = 0; i < 10; i++) {
            const replacedData = replaced.splice(0, 1)[0]
            kanjiData[key].push({
                ...replacedData,
                id: `N${key[0]}.${key[2]}.${kanjiData[key].length + 1}`
            })
        }
    }

    fs.writeFileSync("./newTemp.json", JSON.stringify(replaced, null, 2))
    for (const val in kanjiData) {
        fs.writeFileSync(publicDir + "/" + val, JSON.stringify(kanjiData[val], null, 2))
    }
}

function main() {
    /**
     * @typedef {Object} Vocabulary
     * @property {string} id
     * @property {string} kanji
     * @property {string} component
     * @property {string} hiragana
     * @property {string} enMeaning
     * @property {string} idMeaning
     * @property {"Kata Benda" | "Kata Sifat な" | "Kata Sifat い" | "KK Transitif" | "KK Intransitif" | "Frasa / Klausa"} type
     */

    /** @type {Record<string, Vocabulary[]>} */
    const kanjiData = {}

    fs.readdirSync(publicDir)
        .filter(file => path.extname(file) === '.json' && file[0] == "3")
        .forEach(file => {
            fileLoc = publicDir + "/" + file
            let data = require(fileLoc)
            kanjiData[file] = data
        })

    const remaining = []
    for (const val of migrateId) {
        if (replacement.length == 0) {
            console.info("Replacement exhausted for", val)
            remaining.push(val)
            continue
        }

        const fileName = `${val[1]}_${val[3]}.json`
        const checkIdx = kanjiData[fileName].findIndex(val2 => val2.id == val)
        if (checkIdx != -1) {
            console.info(`Found on ${fileName}: ${val}`)
            console.info(`Before`)
            console.info(kanjiData[fileName][checkIdx])

            const replacementData = replacement.splice(0, 1)[0]
            replaced.push(kanjiData[fileName][checkIdx])
            kanjiData[fileName][checkIdx] = {
                ...replacementData,
                id: kanjiData[fileName][checkIdx].id,
            }

            console.info(`After`)
            console.info(kanjiData[fileName][checkIdx])
            console.info()
        }
    }

    fs.writeFileSync("./archive.json", JSON.stringify(remaining, null, 2))
    fs.writeFileSync("./new.json", JSON.stringify(replacement, null, 2))
    fs.writeFileSync("./newTemp.json", JSON.stringify(replaced, null, 2))

    for (const val in kanjiData) {
        fs.writeFileSync(publicDir + "/" + val, JSON.stringify(kanjiData[val], null, 2))
    }
}