const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, '../../public');

const summary = []
let kanji = []

main2()
// main();

function main2() {
    const data = require("./kanjiSummary.json")
    fs.readdirSync(publicDir)
        .filter(file => path.extname(file) === '.json')
        .forEach(file => {
            const fileLoc = publicDir + "/" + file;
            let data = require(fileLoc);
            kanji.push(data);
        });
    const kanjiData = kanji.flat()

    const result = []
    for (const val of data) {
        if (val.allVersion && val.allVersion.length > 1) {
            for (const val2 of val.allVersion) {
                const findData = kanjiData.find(val3 =>
                    val3.kanji &&
                    val3.id != val.id &&
                    !result.find(val4 => val4.idFirstVer == val3.id) &&
                    val3.kanji.split("/").includes(val2))
                if (findData) {
                    console.info("==============")
                    console.info(val.id)
                    console.info(val2)
                    console.info(val.allVersion)
                    console.info("Found alter version", val2, val.id, "on", findData.id, "as", findData.kanji)
                    const firstVer = kanjiData.find(val4 => val4.id == val.id)
                    const secondVer = kanjiData.find(val4 => val4.id == findData.id)
                    result.push({
                        idFirstVer: firstVer.id,
                        kanjiFirstVer: firstVer.kanji,
                        enMeaningFirstVer: firstVer.enMeaning,
                        idMeaningFirstVer: firstVer.idMeaning,
                        idSecondVer: secondVer.id,
                        kanjiSecondVer: secondVer.kanji,
                        enMeaningSecondVer: secondVer.enMeaning,
                        idMeaningSecondVer: secondVer.idMeaning,
                    })
                }
            }
        }
    }

    fs.writeFileSync("./kanjiAlterVer.json", JSON.stringify(result, 2))
    return result
}

function alterVer(data, kanjiData) {
    const result = []
    for (const val of data) {
        if (val.allVersion && val.allVersion.length > 1) {
            for (const val2 of val.allVersion) {
                const findData = data.find(val3 => val3.id != val.id && !result.find(val4 => val4.idFirstVer == val3.id) && val3.kanji == val2)
                if (findData) {
                    console.info("==============")
                    console.info(val.kanji)
                    console.info(val.allVersion)
                    console.info("Found alter version", val.kanji, val.id, "on", findData.id, "as", findData.kanji)

                    const firstVer = kanjiData.find(val4 => val4.id == val.id)
                    const secondVer = kanjiData.find(val4 => val4.id == findData.id)
                    result.push({
                        idFirstVer: firstVer.id,
                        kanjiFirstVer: firstVer.kanji,
                        enMeaningFirstVer: firstVer.enMeaning,
                        idMeaningFirstVer: firstVer.idMeaning,
                        idSecondVer: secondVer.id,
                        kanjiSecondVer: secondVer.kanji,
                        enMeaningSecondVer: secondVer.enMeaning,
                        idMeaningSecondVer: secondVer.idMeaning,
                    })
                }
            }
        }
    }

    return result
}

function shouldOmit(data) {
    const omit = []
    for (const val of data) {
        if (val.kanji && val.kanji.substring(0, 1) == "お") {
            const regForm = val.kanji.substring(1, val.kanji.length)
            const findData = data.find(val2 => val2.kanji == regForm)
            if (findData) {
                const RegFormlevel = parseInt(findData.id.substring(1, 2))
                const KeigoFormlevel = parseInt(val.id.substring(1, 2))

                if (RegFormlevel > KeigoFormlevel) {
                    omit.push(val)
                } else {
                    omit.push(findData)
                }
            }
        }
    }

    return omit
}

function correction(data) {
    // Current Level - Appropriate Level
    const correction = {}

    for (const val of data) {
        if (val.align === false) {
            const level = val.id.substring(0, 2)
            const label = val.label.substring(5, 7)
            const key = `${level}-${label}`
            if (correction[key]) {
                correction[key].push(val)
            } else {
                correction[key] = [val]
            }
        }
    }

    return correction
}

function sorting(data) {
    return data.sort((a, b) => {
        const partsA = a.id.substring(1).split('.').map(Number);
        const partsB = b.id.substring(1).split('.').map(Number);

        // Rule 1: First number (#1) - Descending (b - a)
        if (partsA[0] !== partsB[0]) {
            return partsB[0] - partsA[0];
        }

        // Rule 2: Second number (#2) - Ascending (a - b)
        if (partsA[1] !== partsB[1]) {
            return partsA[1] - partsB[1];
        }

        // Rule 3: Third number (#3) - Ascending (a - b)
        // We only reach this if the first and second numbers were identical
        return partsA[2] - partsB[2];
    })
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    fs.readdirSync(publicDir)
        .filter(file => path.extname(file) === '.json')
        .forEach(file => {
            const fileLoc = publicDir + "/" + file;
            let data = require(fileLoc);
            kanji.push(data);
        });

    const data = kanji.flat()
    const CHUNK_SIZE = 50;

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);

        console.info(`Processing batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(data.length / CHUNK_SIZE)}...`);

        const fetchPromises = chunk.map(async (kanjiData) => {
            try {
                const resp = await fetch(`https://jisho.org/search/${kanjiData.kanji}`);
                if (!resp.ok) {
                    throw new Error(`HTTP Error: ${resp.status}`);
                }

                const html = await resp.text();
                extractPairedData(html, kanjiData.kanji, kanjiData.id);
            } catch (error) {
                console.error(`Failed to fetch or process target: ${kanjiData}`, error);
            }
        });

        await Promise.all(fetchPromises);

        if (i + CHUNK_SIZE < data.length) {
            await delay(1000);
        }
    }

    // try {
    //     const resp = await fetch(`https://jisho.org/search/張る`);
    //     if (!resp.ok) {
    //         throw new Error(`HTTP Error: ${resp.status}`);
    //     }

    //     const html = await resp.text();
    //     extractPairedData(html, "張る", "N2.3.37");
    // } catch (error) {
    //     // console.error(`Failed to fetch or process target: ${kanjiData}`, error);
    // }

    fs.writeFileSync("./kanjiAlterVer.json", JSON.stringify(alterVer(summary, data), 2))
    fs.writeFileSync("./kanjiOmit.json", JSON.stringify(shouldOmit(data), 2))
    fs.writeFileSync("./kanjiCorrection.json", JSON.stringify(correction(summary), 2))
    fs.writeFileSync("./kanjiSummary.json", JSON.stringify(sorting(summary), 2))
}

function getJlptLevel(labels) {
    const jlptLabel = labels.find(val => val.startsWith("JLPT N"));
    if (!jlptLabel) return 0;

    const match = jlptLabel.match(/JLPT N(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function extractPairedData(html, target, id) {
    const $ = cheerio.load(html);
    let pairs = [];

    $('.concept_light').each((index, element) => {
        const rawKanji = $(element).find('.concept_light-representation .text').text();
        const mainKanji = rawKanji.replace(/<[^>]*>/g, '').trim();

        if (!mainKanji) return;
        const kanjiGroup = new Set([mainKanji]);

        $(element).find('.meaning-tags').each((i, tagEl) => {
            if ($(tagEl).text().trim() === 'Other forms') {

                const wrapperEl = $(tagEl).next('.meaning-wrapper');

                wrapperEl.find('.break-unit').each((j, formEl) => {
                    let formText = $(formEl).text().trim();

                    let kanjiOnly = formText.split('【')[0].trim();

                    if (kanjiOnly) {
                        kanjiGroup.add(kanjiOnly);
                    }
                });
            }
        });

        const labels = [];
        $(element).find('.concept_light-status .label').each((i, el) => {
            labels.push($(el).text().trim());
        });

        pairs.push({
            kanji: [...kanjiGroup],
            labels: labels
        });
    });

    const relevantPairs = pairs.filter(pair => pair.kanji.includes(target));
    let bestPair = null;

    for (const pair of relevantPairs) {
        // console.info(pair.kanji);
        // console.info(pair.labels);

        if (!bestPair) {
            bestPair = pair;
            continue;
        }

        const currentJlpt = getJlptLevel(pair.labels);
        const bestJlpt = getJlptLevel(bestPair.labels);

        const isCurrentFirst = pair.kanji[0] === target;
        const isBestFirst = bestPair.kanji[0] === target;

        const currentHasLabels = pair.labels.length > 0;
        const bestHasLabels = bestPair.labels.length > 0;

        // RULE 1: Prioritize lower JLPT level (N5 > N4 > N3 > N2 > N1)
        if (currentJlpt !== bestJlpt) {
            if (currentJlpt > bestJlpt) {
                bestPair = pair; // Higher N-number = lower JLPT level
            }
            continue;
        }

        // RULE 2: If JLPT levels are equal, prioritize First Occurrence
        if (isCurrentFirst !== isBestFirst) {
            if (isCurrentFirst) {
                bestPair = pair;
            }
            continue;
        }

        // RULE 3: If First Occurrence status is equal, prioritize having labels
        if (currentHasLabels !== bestHasLabels) {
            if (currentHasLabels) {
                bestPair = pair;
            }
            continue;
        }
    }

    if (bestPair) {
        // console.info("Selected Pair for: " + target);
        // console.info(bestPair.kanji);
        // console.info(bestPair.labels);

        let align = null
        const jlptLabel = bestPair.labels.find(val => val.startsWith("JLPT N"));
        if (jlptLabel) {
            const level = id.substring(0, 2)
            const label = jlptLabel.substring(5, 7)
            align = level == label
        }
        summary.push({
            id,
            kanji: target,
            allVersion: bestPair.kanji,
            align,
            label: jlptLabel || null
        })
    } else {
        summary.push({
            id,
            kanji: target,
            allVersion: null,
            align: null,
            label: null
        })
    }
}

/**
 * With JLPT Word => 番号　Done
 * Containing Hiragana => 極める Done
 * Without JLPT Word　=> 技術者　Done
 * Without JLPT Label And Not In The First List => 極める Done
 * Treated As Other Kanji => 街, 河
 * Not Exists => 募集中 Done
 */