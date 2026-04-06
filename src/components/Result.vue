<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { progressStore, resultStore } from '../store';
import type { KanjiProgress, KanjiType } from '../type';
import Accordion from '../volt/Accordion.vue';
import AccordionPanel from '../volt/AccordionPanel.vue';
import AccordionHeader from '../volt/AccordionHeader.vue';
import AccordionContent from '../volt/AccordionContent.vue';
import Button from '../volt/Button.vue';
import DangerButton from '../volt/DangerButton.vue';
import SecondaryButton from '../volt/SecondaryButton.vue';
import Message from '../volt/Message.vue';
import KanjiCard from './KanjiCard.vue';

const wrongActive = ref(true)
const correctActive = ref(false)
const noneActive = ref(false)
const progressActive = ref(false)

const resultData = resultStore()
const progressData = progressStore()

const progressArr: KanjiProgress[] = Object.entries(progressData.progress)
    .map(([kanjiId, value]) => {
        let color: KanjiProgress["color"] = "bg-red-500"

        if (value.amount <= 1) color = "bg-red-500";
        else if (value.amount <= 2) color = "bg-orange-500";
        else if (value.amount <= 3) color = "bg-yellow-500";
        else if (value.amount <= 4) color = "bg-lime-500";
        else if (value.amount <= 5) color = "bg-green-500";

        return {
            kanjiId,
            kanji: value.kanji,
            percent: parseInt(((value.amount / 5) * 100).toFixed(0)),
            color
        };
    })
    .sort((a, b) => {
        const parse = (id: any) => {
            const [, n1, n2, n3] = id.match(/^N(\d+)\.(\d+)\.(\d+)$/);
            return [Number(n1), Number(n2), Number(n3)];
        };

        const [a1, a2, a3] = parse(a.kanjiId);
        const [b1, b2, b3] = parse(b.kanjiId);

        // number1 DESC
        if (a1 !== b1) return b1! - a1!;

        // number2 ASC
        if (a2 !== b2) return a2! - b2!;

        // number3 ASC
        return a3! - b3!;
    })

const groupedProgress: KanjiProgress[][] = []
for (const val of progressArr) {
    const level = val.kanjiId.split(".")[0]
    const levelNumber = Number(level!.slice(1))
    const index = 5 - levelNumber

    if (!groupedProgress[index]) {
        groupedProgress[index] = []
    }

    groupedProgress[index].push(val)
}

const routerOpt = useRouter()
const kanjiData = ref<KanjiType[]>([...resultData.wrong])
if (kanjiData.value.length == 0) {
    setNoneAnswer()
    if (kanjiData.value.length == 0) {
        setCorrectAnswer()
        if (kanjiData.value.length == 0) {
            routerOpt.replace({ name: "home" })
        }
    }
}

function setProgressData() {
    progressActive.value = true
    wrongActive.value = false
    correctActive.value = false
    noneActive.value = false
}

function setCorrectAnswer() {
    progressActive.value = false
    wrongActive.value = false
    correctActive.value = true
    noneActive.value = false
    kanjiData.value = [];
    kanjiData.value = [...resultData.correct];
}

function setWrongAnswer() {
    progressActive.value = false
    wrongActive.value = true
    correctActive.value = false
    noneActive.value = false
    kanjiData.value = [];
    kanjiData.value = [...resultData.wrong];
}

function setNoneAnswer() {
    progressActive.value = false
    wrongActive.value = false
    correctActive.value = false
    noneActive.value = true
    kanjiData.value = [];
    kanjiData.value = [...resultData.none];
}

function goHome() {
    resultData.clearAnswer()
    routerOpt.push({ name: "home" })
}
</script>

<template>
    <div class="flex justify-center items-center my-2 py-2">
        <DangerButton class="mx-4 text-sm md:text-base" @click="setWrongAnswer" label="Jawaban Salah"
            :variant="wrongActive ? 'link' : 'outlined'"></DangerButton>
        <SecondaryButton class="mx-4 text-sm md:text-base" @click="setNoneAnswer" label="Tidak Dijawab"
            :variant="noneActive ? 'link' : 'outlined'"></SecondaryButton>
        <Button class="mx-4 text-sm md:text-base" @click="setCorrectAnswer" label="Jawaban Benar"
            :variant="correctActive ? 'link' : 'outlined'"></Button>
    </div>
    <div class="flex justify-center items-center my-2 mb-4">
        <Button @click="goHome" icon="pi pi-home" aria-label="Save" />
        <Button class="mx-4 text-sm md:text-base" @click="setProgressData" label="Progress"
            :variant="progressActive ? 'link' : 'outlined'"></Button>
    </div>
    <div v-if="!progressActive" class="mx-4 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        <KanjiCard v-for="(item, index) in kanjiData" :key="index" v-bind="item" />
    </div>
    <div v-else class="mx-4">
        <Message class="my-4 lg:my-6 text-base">Semakin tinggi tingkat kemahiran, semakin jarang kanji tersebut akan
            muncul
        </Message>
        <Accordion multiple>
            <AccordionPanel v-for="(progressArr, index) in groupedProgress" :key="index" :value="index">
                <AccordionHeader class="sticky top-0 z-10 bg-white font-bold text-base lg:text-xl">
                    N{{ 5 - index }}
                </AccordionHeader>

                <AccordionContent>
                    <div class="grid grid-cols-3 lg:grid-cols-9 gap-4">
                        <div v-for="progress in progressArr" :key="progress.kanjiId">
                            <div class="flex items-center gap-2">
                                <span :class="[
                                    'inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full',
                                    progress.color
                                ]"></span>

                                <div class="text-sm lg:text-base">
                                    <div class="text-sm font-medium">{{ progress.kanjiId }}</div>
                                    <div class="text-xs font-medium">{{ progress.kanji }}</div>
                                    <div class="font-extrabold">({{ progress.percent }}%)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>