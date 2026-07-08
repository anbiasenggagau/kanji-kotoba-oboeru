<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { flagStore, progressStore, resultStore } from '../store';
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
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const wrongActive = ref(true)
const correctActive = ref(false)
const noneActive = ref(false)
const progressActive = ref(false)

const routerOpt = useRouter()
const confirm = useConfirm();
const toast = useToast();
const resultData = resultStore()
const progressData = progressStore()
const flagData = flagStore()
const colorOrder = [
    "bg-gray-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
];

let sumColorOrdered = ref<Record<string, number>>({})
let sumColorGroupOrdered = ref<Record<string, number>[]>([])
let groupedProgress = ref<KanjiProgress[][]>([])

watch(
    () => progressData.progress,
    () => {
        const sumColor: Record<string, number> = {}
        const sumColorGroup: Record<string, number>[] = []

        // Summarize Progress Data
        const progressArr = Object.entries(progressData.progress)
            .map(([kanjiId, value]) => {
                let color: KanjiProgress["color"] = "bg-gray-500"

                if (value.amount > 0) {
                    if (value.amount <= 1) color = "bg-red-500";
                    else if (value.amount <= 2) color = "bg-orange-500";
                    else if (value.amount <= 3) color = "bg-yellow-500";
                    else if (value.amount <= 4) color = "bg-lime-500";
                    else if (value.amount <= 5) color = "bg-green-500";
                }

                // Summarize how many amount of each progress (Red, Orange, Yellow, Green)
                sumColor[color] = (sumColor[color] ?? 0) + 1;

                // Also summarize how many amount of each progress of each level (N5, N4, N3)
                const level = kanjiId.split(".")[0]!
                const levelNumber = Number(level!.slice(1))
                const index = 5 - levelNumber
                sumColorGroup[index] ??= {};
                sumColorGroup[index][color] = (sumColorGroup[index][color] ?? 0) + 1;

                return {
                    kanjiId,
                    kanji: value.kanji,
                    percent: parseInt(((value.amount / 5) * 100).toFixed(0)),
                    streak: value.trueStack,
                    flagged: flagData.checkKanjiExist(value.kanji),
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
            }) as KanjiProgress[]

        // Ordering progress color
        sumColorOrdered.value = Object.fromEntries(
            colorOrder
                .filter(c => sumColor[c])
                .map(c => [c, sumColor[c]])
        ) as Record<string, number>

        // Ordering progress color for each group
        sumColorGroupOrdered.value =
            sumColorGroup.map(group =>
                Object.fromEntries(
                    colorOrder
                        .filter(c => c in group)
                        .map(c => [c, group[c]!])
                )
            )

        // Contruct detail progressed kanji
        const tempData: KanjiProgress[][] = []
        for (const val of progressArr) {
            const level = val.kanjiId.split(".")[0]
            const levelNumber = Number(level!.slice(1))
            const index = 5 - levelNumber

            if (!tempData[index]) {
                tempData[index] = []
            }

            tempData[index].push(val)
        }
        groupedProgress.value = tempData
    },
    {
        deep: true,
        immediate: true
    }
);

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

function getBalancedCols(group: Record<string, number> | undefined): number {
    if (!group) return 1;

    const totalItems = Object.keys(group).length;

    // If you have 3 or fewer items, keep them all on 1 row
    if (totalItems <= 3) return totalItems || 1;

    // Otherwise, split them perfectly down the middle into 2 balanced rows
    return Math.ceil(totalItems / 2);
}

function confrimProgressReset() {
    confirm.require({
        message: 'Apakah anda yakin ingin reset progress',
        header: 'Konfirmasi',
        rejectProps: {
            label: 'Batalkan',
            severity: 'success',
        },
        acceptProps: {
            label: 'Reset Progress',
            severity: 'secondary',
            outlined: true
        },
        accept: () => {
            progressData.clearData()
            toast.add({ severity: 'info', summary: 'Berhasil', detail: 'progress telah di-reset', life: 3000 });
        },
    });
};

function importProgress() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files![0]
        if (!file) return

        try {
            const text = await file.text()
            const jsonData = JSON.parse(text)
            progressData.importData(jsonData)
        } catch (err: any) {
            toast.add({ severity: 'error', summary: "Error", detail: err.message, life: 3000 })
        }
    }
    fileInput.click()
}

function exportProgress() {
    const data = JSON.stringify(progressData.progress)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `progress-${formatTimestamp()}.json`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function formatTimestamp(date: Date = new Date()): string {
    const dtf = new Intl.DateTimeFormat('en', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });

    const parts = dtf.formatToParts(date);
    const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
        parts.find(p => p.type === type)?.value ?? '';

    const yyyy = getPart('year');
    const mm = getPart('month');
    const dd = getPart('day');
    const hh = getPart('hour');
    const min = getPart('minute');
    const ss = getPart('second');

    return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
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

        <div class="col-flex justify-center items-center text-center">
            <div class="flex flex-wrap justify-center gap-2 md:gap-3.5 lg:gap-5.5">
                <div v-for="(num, color) in sumColorOrdered" :key="color" class="flex items-center gap-1">
                    <span :class="[
                        'inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full',
                        color
                    ]"></span>
                    <span class="text-sm font-bold">
                        {{ num }}
                    </span>
                </div>
            </div>
        </div>

        <div class="flex justify-center items-center my-2 py-2">
            <DangerButton class="mx-4 text-sm md:text-base" @click="confrimProgressReset" label="Reset Progress"
                variant="outlined">
            </DangerButton>
            <SecondaryButton class="mx-4 text-sm md:text-base" @click="importProgress" label="Impor Progress"
                variant="outlined">
            </SecondaryButton>
            <Button class="mx-4 text-sm md:text-base" @click="exportProgress" label="Simpan Progress"
                variant="outlined"></Button>
        </div>

        <Accordion multiple>
            <AccordionPanel v-for="(progressArr, index) in groupedProgress" :key="index" :value="index">
                <AccordionHeader
                    class="sticky top-0 z-10 bg-white font-bold text-base lg:text-xl flex items-center justify-between">
                    <!-- LEFT SIDE -->
                    <div class="flex items-center font-bold gap-4 md:gap-6 lg:gap-8">
                        <span>N{{ 5 - index }}</span>

                        <div class="grid md:flex md:flex-wrap gap-2 md:gap-3.5 lg:gap-5.5"
                            :style="{ gridTemplateColumns: `repeat(${getBalancedCols(sumColorGroupOrdered[index])}, minmax(0, 1fr))` }">

                            <div v-for="(num, color) in sumColorGroupOrdered[index]" :key="color"
                                class="flex items-center gap-1 justify-center md:justify-start">
                                <span :class="[
                                    'inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full',
                                    color
                                ]"></span>
                                <span class="text-sm font-bold">
                                    {{ num }}
                                </span>
                            </div>
                        </div>
                    </div>
                </AccordionHeader>

                <AccordionContent>
                    <div class="grid grid-cols-3 lg:grid-cols-9 gap-4">
                        <div v-for="progress in progressArr" :key="progress.kanjiId">
                            <div class="relative flex items-center gap-2">
                                <span :class="[
                                    'inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full',
                                    progress.color
                                ]"></span>

                                <div class="text-sm lg:text-base">
                                    <div class="text-sm font-medium" :class="progress.flagged ? `text-red-700` : ``">{{
                                        progress.kanjiId }}</div>
                                    <div class="text-xs font-medium">{{ progress.kanji }}</div>
                                    <div class="flex items-center">
                                        <div class="font-extrabold">({{ progress.percent }}%)</div>
                                        <div class="ml-1 md:ml-1.5 lg:ml-2 text-xs lg:text-sm text-green-500 font-bold">
                                            {{ progress.streak }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>