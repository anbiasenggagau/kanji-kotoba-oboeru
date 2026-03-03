<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { progressStore, resultStore } from '../store';
import type { KanjiType } from '../type';
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

const progressArr = Object.entries(progressData.progress)
    .map(([kanjiId, value]) => {
        let color = ""

        if (value.amount == 1) color = "bg-red-500"
        else if (value.amount == 2) color = "bg-orange-500"
        else if (value.amount == 3) color = "bg-yellow-500"
        else if (value.amount == 4) color = "bg-lime-500"
        else if (value.amount == 5) color = "bg-green-500"

        return {
            kanjiId,
            percent: value.amount / 5 * 100,
            color
        }
    })
    .sort((a, b) =>
        a.kanjiId.localeCompare(b.kanjiId, undefined, { numeric: true })
    )

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
        <Message class="my-4 lg:my-6">Semakin tinggi tingkat kemahiran, semakin jarang kanji tersebut akan muncul
        </Message>
        <div class="grid grid-cols-3 lg:grid-cols-9 gap-4">
            <div v-for="progress in progressArr" :key="progress.kanjiId" class="flex items-center gap-2">
                <span :class="['w-4 h-4 rounded-full', progress.color]"></span>
                <div class="text-xl">
                    <div class="font-medium">{{ progress.kanjiId }}</div>
                    <div class="font-extrabold">({{ progress.percent }}%)</div>
                </div>
            </div>
        </div>
    </div>
</template>