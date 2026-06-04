const fs = require('fs');
const path = require('path');
const newData = require("./new.json")

const data = []
for (let i = 0; i <= 2000; i++) {
    data.push(i)
}

// for (let i = 0; i < 10; i++) {
// }
data.sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)

fs.writeFileSync("./temp.json", JSON.stringify(data, null, 2));