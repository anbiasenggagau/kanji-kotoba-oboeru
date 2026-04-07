import { defineStore } from "pinia"
import { ref } from "vue"
import type { KanjiProgressStore, KanjiType } from "./type"
import { volumes } from "./const"

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

export const kanjiTempStore = defineStore('kanjiTempStore', () => {
    const kanji = ref<Record<string, KanjiType>>({})
    const initialized = ref(false)

    async function initialize() {
        if (initialized.value) {
            return
        }

        const downloadedKanji: KanjiType[] = []
        const files: string[] = []
        for (const level in volumes) {
            for (const volumeNumb of volumes[level]!) {
                files.push(`${level[1]}_${volumeNumb}.json`)
            }
        }
        downloadedKanji.push(...(await Promise.all(
            files.map(file => fetch(file).then(r => r.json()))
        )).flat()
        )
        downloadedKanji.forEach(k => kanji.value[k.id] = k)
        initialized.value = true
    }

    if (!initialized.value)
        initialize()

    function getKanji(kanjiId: string) {
        return kanji.value[kanjiId]
    }

    return { kanji, initialize, getKanji }
})

export const progressStore = defineStore('progressStore', () => {
    const progress = ref<Record<string, KanjiProgressStore>>({})
    const kanjiData = kanjiTempStore()
    const used = ref(false)

    async function initialize() {
        if (used.value) {
            return
        }

        await kanjiData.initialize()
        const saved = localStorage.getItem('progressStore')
        if (saved) {
            progress.value = JSON.parse(saved)
            for (const kanjiId in progress.value) {
                // Auto migrate progress that have no kanji yet
                if (progress.value[kanjiId]!.kanji == undefined) {
                    let findKanji = kanjiData.getKanji(kanjiId)
                    if (findKanji) {
                        progress.value[kanjiId]!.kanji = findKanji.kanji
                    }
                }

                // Auto Migration changes data
                let findKanji = kanjiData.getKanji(kanjiId)
                if (findKanji && findKanji.kanji != progress.value[kanjiId]!.kanji) {
                    progress.value[kanjiId]!.kanji = findKanji.kanji
                }

                progress.value[kanjiId]!.lastProgress = new Date(progress.value[kanjiId]!.lastProgress)
                const diff = (new Date()).getTime() - progress.value[kanjiId]!.lastProgress.getTime()

                // decrease progress point by floor rounding of 3 day number
                if (diff > 259200000) {
                    progress.value[kanjiId]!.amount = progress.value[kanjiId]!.amount - Math.floor(diff / 259200000)
                    if (progress.value[kanjiId]!.amount <= 0) {
                        delete progress.value[kanjiId]
                    } else {
                        progress.value[kanjiId]!.lastProgress = new Date()
                    }
                }
            }

            setLocalStorage("progressStore", progress.value)
        }
        used.value = true
    }

    if (!used.value)
        initialize()

    function progressTrue(kanji: KanjiType) {
        if (progress.value[kanji.id]) {
            if (progress.value[kanji.id]!.amount < 5) {

                // Handle sameday progress
                if (progress.value[kanji.id]!.lastProgress.toDateString() == (new Date()).toDateString()) {
                    progress.value[kanji.id]!.trueStack++

                    if (progress.value[kanji.id]!.trueStack == 1) {
                        progress.value[kanji.id]!.amount = progress.value[kanji.id]!.amount + 0.5
                    } else if (progress.value[kanji.id]!.trueStack == 2) {
                        progress.value[kanji.id]!.amount = progress.value[kanji.id]!.amount + 0.25
                    }
                } else {
                    progress.value[kanji.id]!.amount++
                    progress.value[kanji.id]!.trueStack = 0
                }
            }

            if (progress.value[kanji.id]!.amount > 5) progress.value[kanji.id]!.amount = 5
            progress.value[kanji.id]!.lastProgress = new Date()
        } else {
            progress.value[kanji.id] = {
                kanji: kanji.kanji,
                amount: 1,
                trueStack: 0,
                falseStack: 0,
                lastProgress: new Date()
            }
        }
        setLocalStorage("progressStore", progress.value)
    }

    function progressFalse(kanjiId: string) {
        if (progress.value[kanjiId]) {

            // Handle sameday progress
            if (progress.value[kanjiId].lastProgress.toDateString() == (new Date()).toDateString()) {
                progress.value[kanjiId].falseStack++

                if (progress.value[kanjiId].falseStack == 1) {
                    progress.value[kanjiId].amount = progress.value[kanjiId].amount - 0.5
                } else if (progress.value[kanjiId].falseStack == 2) {
                    progress.value[kanjiId].amount = progress.value[kanjiId].amount - 0.25
                }
            } else {
                progress.value[kanjiId].amount--
                progress.value[kanjiId].falseStack = 0
            }

            if (progress.value[kanjiId].amount < 0) progress.value[kanjiId].amount = 0
            progress.value[kanjiId].lastProgress = new Date()


            if (progress.value[kanjiId].amount <= 0) {
                delete progress.value[kanjiId]
            }
        }
        setLocalStorage("progressStore", progress.value)
    }

    function appear(kanjiId: string): boolean {
        // if progress not found, make it appear
        if (!progress.value[kanjiId]) {
            return true
        }
        // running odds if progress is tracked
        return Math.random() > (progress.value[kanjiId].amount + progress.value[kanjiId].trueStack) / 5
    }

    function getProgress(kanjiId: string): number {
        if (progress.value[kanjiId]) return progress.value[kanjiId].amount
        return 0
    }

    return { progress, getProgress, progressTrue, progressFalse, appear }
})

export const flagStore = defineStore('flagStore', () => {
    const flag = ref<Record<string, KanjiType>>({})
    const kanjiData = kanjiTempStore()
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
        if (used.value) {
            return
        }

        const saved = localStorage.getItem('flagStore')
        if (saved) {
            flag.value = JSON.parse(saved)
        }
        used.value = true
    }

    if (!used.value)
        initialize()

    async function getKanji() {
        await kanjiData.initialize()
        const result: KanjiType[] = []
        for (const data in flag.value) {

            // Auto Migration for EN & ID Translation
            if (!Object.keys(flag.value[data]!).includes("idMeaning")) {
                let findKanji = kanjiData.getKanji(flag.value[data]!.id)
                if (findKanji) {
                    flag.value[data] = findKanji
                }
            }

            // Auto Migration changes data
            let findKanji = kanjiData.getKanji(flag.value[data]!.id)
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
            }

            result.push(flag.value[data]!)
        }
        return result
    }

    return { flag, getKanji, pushData, removeData, clearData, checkKanjiExist }
})

function setLocalStorage(memoryId: string, data: any) {
    localStorage.setItem(memoryId, JSON.stringify(data))
}

function clearLocalStorage(memoryId: string) {
    localStorage.removeItem(memoryId)
}