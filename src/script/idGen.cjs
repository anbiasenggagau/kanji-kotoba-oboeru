const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../public');

fs.readdirSync(publicDir)
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
        fileLoc = publicDir + "/" + file
        let data = require(fileLoc)
        data = data.map((val, idx) => {
            return {
                id: `N${file[0]}.${file[2]}.${idx + 1}`,
                ...val,
            }
        })

        fs.writeFileSync(publicDir + "/" + file, JSON.stringify(data, null, 2))
    });