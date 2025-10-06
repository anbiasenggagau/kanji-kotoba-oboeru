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
        data: [] as string[]
    }),
    actions: {
        setData(data: string[]) {
            this.data = data
        },
        clearData() {
            this.data = []
        }
    }
})