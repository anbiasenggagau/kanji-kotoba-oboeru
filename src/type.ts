export type KanjiType = {
    id: string
    kanji: string
    hiragana: string
    type: string
    enMeaning: string
    idMeaning: string
}

export type KanjiProgressStore = {
    kanji: string,
    amount: number,
    trueStack: number,
    falseStack: number,
    lastProgress: Date
}

export type KanjiProgress = {
    kanjiId: string,
    kanji: string
    percent: number,
    streak: number,
    color: "bg-red-500" | "bg-orange-500" | "bg-yellow-500" | "bg-lime-500" | "bg-green-500",
}