import { defineStore } from "pinia"
import { ref } from "vue"
import type { KanjiType } from "./type"

export const resultStore = defineStore("resultStore", {
    state: () => ({
        correct: [] as KanjiType[],
        wrong: [] as KanjiType[],
        none: [] as KanjiType[],
    }),
    actions: {
        setAnswer(correct: KanjiType[], wrong: KanjiType[], none: KanjiType[]) {
            this.correct = correct
            this.wrong = wrong
            this.none = none
        },
        clearAnswer() {
            this.correct = []
            this.wrong = []
            this.none = []
        }
    }
})

export const kanjiTestStore = defineStore("kanjiTestStore", {
    state: () => ({
        data: [] as string[],
        max: 0 as number
    }),
    actions: {
        setData(data: string[], max: number = 0) {
            this.data = data
            this.max = max
        },
        clearData() {
            this.data = []
            this.max = 0
        }
    }
})

export const flagStore = defineStore('flagStore', () => {
    const flag = ref<Record<string, KanjiType>>({})
    const used = ref(false)

    function pushData(data: KanjiType) {
        flag.value[data.kanji] = data
        setLocalStorage("flagStore", flag.value)
    }

    function removeData(kanji: string) {
        if (Object.keys(flag.value).length > 0) {
            delete flag.value[kanji]
            setLocalStorage("flagStore", flag.value)
        }
    }

    function checkKanjiExist(kanji: string): boolean {
        if (flag.value[kanji]) {
            return true
        }
        return false
    }

    function clearData() {
        flag.value = {}
        clearLocalStorage("flagStore")
    }

    function initialize() {
        const saved = localStorage.getItem('flagStore')
        if (saved) {
            flag.value = JSON.parse(saved)
        }
        used.value = true
    }

    if (!used.value)
        initialize()

    async function getKanji() {
        const kanjiTemp: KanjiType[] = []
        const result: KanjiType[] = []
        for (const data in flag.value) {

            // Auto Migration for EN & ID Translation
            if (!Object.keys(flag.value[data]!).includes("idMeaning")) {
                let findKanji = kanjiTemp.find(val => flag.value[data]!.id == val.id)
                if (findKanji) {
                    flag.value[data] = findKanji
                } else {
                    const file = flag.value[data]!.id[1] + "_" + flag.value[data]!.id[3] + ".json"
                    const resp = await fetch(file)
                    kanjiTemp.push(...(await resp.json()))
                    findKanji = kanjiTemp.find(val => flag.value[data]!.id == val.id)
                    flag.value[data] = findKanji!
                }
            }

            // Auto Migration changes data
            let findKanji = kanjiTemp.find(val => val.id == flag.value[data]!.id)
            if (findKanji) {
                if (
                    findKanji.kanji != flag.value[data]!.kanji ||
                    findKanji.type != flag.value[data]!.type ||
                    findKanji.hiragana != flag.value[data]!.hiragana ||
                    findKanji.enMeaning != flag.value[data]!.enMeaning ||
                    findKanji.idMeaning != flag.value[data]!.idMeaning
                ) {
                    flag.value[data] = findKanji
                }
            } else {
                const file = flag.value[data]!.id[1] + "_" + flag.value[data]!.id[3] + ".json"
                const resp = await fetch(file)
                kanjiTemp.push(...(await resp.json()))
                findKanji = kanjiTemp.find(val => val.id == flag.value[data]!.id)!
                if (
                    findKanji.kanji != flag.value[data]!.kanji ||
                    findKanji.type != flag.value[data]!.type ||
                    findKanji.hiragana != flag.value[data]!.hiragana ||
                    findKanji.enMeaning != flag.value[data]!.enMeaning ||
                    findKanji.idMeaning != flag.value[data]!.idMeaning
                ) {
                    flag.value[data] = findKanji
                }
            }

            result.push(flag.value[data]!)
        }
        return result
    }

    return { flag, getKanji, pushData, removeData, clearData, checkKanjiExist }
})

export const progressStore = defineStore('progressStore', () => {
    const progress = ref<Record<string, { amount: number, lastProgress: Date }>>({})
    const used = ref(false)

    function initialize() {
        const saved = localStorage.getItem('progressStore')
        if (saved) {
            progress.value = JSON.parse(saved)
            for (const kanjiId in progress.value) {
                progress.value[kanjiId]!.lastProgress = new Date(progress.value[kanjiId]!.lastProgress)
                if ((new Date()).getTime() - progress.value[kanjiId]!.lastProgress.getTime() > 432000000) {
                    if (progress.value[kanjiId]!.amount > 1) {
                        progress.value[kanjiId]!.amount--
                    } else {
                        delete progress.value[kanjiId]
                    }
                }
            }
        }
        used.value = true
    }

    if (!used.value)
        initialize()

    function progressTrue(kanjiId: string) {
        if (progress.value[kanjiId]) {
            if (progress.value[kanjiId].amount < 5) {
                progress.value[kanjiId].amount++
            }

            progress.value[kanjiId].lastProgress = new Date()
        } else {
            progress.value[kanjiId] = {
                amount: 1,
                lastProgress: new Date()
            }
        }
        setLocalStorage("progressStore", progress.value)
    }

    function progressFalse(kanjiId: string) {
        if (progress.value[kanjiId] && progress.value[kanjiId].amount != 1) {
            progress.value[kanjiId].amount--
            progress.value[kanjiId].lastProgress = new Date()
        } else {
            delete progress.value[kanjiId]
        }
        setLocalStorage("progressStore", progress.value)
    }

    function appear(kanjiId: string): boolean {
        // if progress not found, make it appear
        if (!progress.value[kanjiId]) {
            return true
        }
        // running odds if progress is tracked
        else if (Math.random() > progress.value[kanjiId].amount / 5) {
            return true
        }

        return false
    }

    return { progress, progressTrue, progressFalse, appear }
})

function setLocalStorage(memoryId: string, data: any) {
    localStorage.setItem(memoryId, JSON.stringify(data))
}

function clearLocalStorage(memoryId: string) {
    localStorage.removeItem(memoryId)
}