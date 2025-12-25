const fs = require('fs');
const path = require('path');
const newData = require("./new.json")

const publicDir = path.join(__dirname, '../../public');
const existingData = {};

fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        const data = require(publicDir + "/" + file)
        data.forEach(val => {
            val = val.kanji
            existingData[val] = ""
        })
    });

const cleanData = newData.map(val => {
    if (
        existingData[val] == undefined &&
        existingData[val + "する"] == undefined &&
        (
            val.slice(val.length - 2) == "する" &&
            existingData[val.slice(0, val.length - 2)]
        )
    )
        return val
    else {
        console.log(val)
        return undefined
    }
}).filter(val => val != undefined)

const outputFilePath = path.join(__dirname, 'newClean.json');
fs.writeFileSync(outputFilePath, JSON.stringify(cleanData, null, 2));