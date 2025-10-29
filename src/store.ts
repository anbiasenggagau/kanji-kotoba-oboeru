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

export const kanjiStore = defineStore("kanjiList", {
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
        setLocalStorage(flag.value)
    }

    function removeData(kanji: string) {
        if (Object.keys(flag.value).length > 0) {
            delete flag.value[kanji]
            setLocalStorage(flag.value)
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
        clearLocalStorage()
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

    function getKanji() {
        const result: KanjiType[] = []
        for (const data in flag.value) {
            result.push(flag.value[data]!)
        }
        console.info(result)
        return result
    }

    return { flag, getKanji, pushData, removeData, clearData, checkKanjiExist }
})

async function setLocalStorage(data: Record<string, KanjiType>) {
    localStorage.setItem("flagStore", JSON.stringify(data))
}

async function clearLocalStorage() {
    localStorage.removeItem("flagStore")
}