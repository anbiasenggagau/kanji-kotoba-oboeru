import { defineStore } from "pinia"
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

export const flagStore = defineStore("flagStore", {
    state: () => ({
        flag: [] as KanjiType[]
    }),
    actions: {
        initialize() {
            const flag = localStorage.getItem("flagStore")
            if (flag) {
                this.flag = JSON.parse(flag)
            }
        },
        pushData(data: KanjiType) {
            this.flag.push(data)
            setLocalStorage(this.flag)
        },
        removeData(index: number) {
            if (index >= 0 && this.flag.length > 0) {
                this.flag.splice(index, 1)
                setLocalStorage(this.flag)
            }
        },
        clearData() {
            this.flag = []
            clearLocalStorage()
        }
    }
})

async function setLocalStorage(data: KanjiType[]) {
    localStorage.setItem("flagStore", JSON.stringify(data))
}

async function clearLocalStorage() {
    localStorage.removeItem("flagStore")
}