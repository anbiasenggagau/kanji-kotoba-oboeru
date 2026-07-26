const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, '../../../public');

const kana = "ーッアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポキャキュキョギャギュギョニャニュニョヒャヒュヒョビャビュビョピャピュピョミャミュミョリャリュリョジャジュジェジョチャチュチェチョシャシュシェショ"
const summary = []
let kanji = []

main();

async function main() {
    const start = 1
    const end = 100
    const level = "n2"
    fs.readdirSync(publicDir)
        .filter(file => path.extname(file) === '.json')
        .forEach(file => {
            const fileLoc = publicDir + "/" + file;
            const data = require(fileLoc);
            kanji.push(data);
        });
    kanji = kanji.flat()

    for (let i = start; i <= end; i++) {
        console.info("Attempt:", i)
        try {
            const resp = await fetch(`https://jisho.org/search/%20%23common%20%23jlpt-${level}%20%23words?page=${i}`);
            if (!resp.ok) {
                throw new Error(`HTTP Error: ${resp.status}`);
            }

            const html = await resp.text();
            extractPairedData(html, level);
        } catch (error) {
            console.error(error);
        }
    }

    fs.writeFileSync(`./kanjiNew-${level}.json`, JSON.stringify(summary, null, 2))
}

function extractPairedData(html, level) {
    const $ = cheerio.load(html);
    let pairs = [];

    $('.concept_light').each((index, element) => {
        const rawKanji = $(element).find('.concept_light-representation .text').text();
        const mainKanji = rawKanji.replace(/<[^>]*>/g, '').trim();

        if (!mainKanji) return;
        if (kana.includes(mainKanji.at(0))) return

        // 1. Extract Labels
        const labels = [];
        $(element).find('.concept_light-status .label').each((i, el) => {
            labels.push($(el).text().trim());
        });

        // 2. Extract Meanings
        const meanings = [];
        $(element).find('.meaning-meaning').each((i, el) => {
            meanings.push($(el).text().trim());
        });

        if (labels.includes(`JLPT ${level.toUpperCase()}`)
            && labels.includes("Common word")
            && !kanji.some(val => {
                if (val.kanji) {
                    return val.kanji.split("/").includes(mainKanji)
                } else {
                    return false
                }
            })
        ) {
            pairs.push({
                kanji: mainKanji,
                labels: labels,
                meaning: meanings
            });
        }
    });

    // Output the results
    for (const pair of pairs) {
        // console.info(pair.kanji);
        // console.info(pair.labels);
        // console.info(pair.meaning);

        summary.push({
            kanji: pair.kanji,
            meaning: pair.meaning
        })
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}