<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { resultStore } from '../store';
import type { KanjiType } from '../type';
import Button from '../volt/Button.vue';
import DangerButton from '../volt/DangerButton.vue';
import SecondaryButton from '../volt/SecondaryButton.vue';
import KanjiCard from './KanjiCard.vue';

const wrongActive = ref(true)
const correctActive = ref(false)
const noneActive = ref(false)

const resultData = resultStore()
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

function setCorrectAnswer() {
    wrongActive.value = false
    correctActive.value = true
    noneActive.value = false
    kanjiData.value = [];
    kanjiData.value = [...resultData.correct];
}

function setWrongAnswer() {
    wrongActive.value = true
    correctActive.value = false
    noneActive.value = false
    kanjiData.value = [];
    kanjiData.value = [...resultData.wrong];
}

function setNoneAnswer() {
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
    </div>
    <div class="mx-4 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        <KanjiCard v-for="(item, index) in kanjiData" :key="index" v-bind="item" />
    </div>
</template>