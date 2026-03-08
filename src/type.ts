export type KanjiType = {
    id: string
    kanji: string
    hiragana: string
    type: string
    enMeaning: string
    idMeaning: string
}

export type KanjiProgress = {
    kanjiId: string,
    kanji: string
    percent: number,
    color: "bg-red-500" | "bg-orange-500" | "bg-yellow-500" | "bg-lime-500" | "bg-green-500",
}