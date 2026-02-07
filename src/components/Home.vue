<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { volumes } from "../const";
import { kanjiTestStore } from "../store";
import Button from '../volt/Button.vue';
import Card from '../volt/Card.vue';
import Checkbox from "../volt/Checkbox.vue";
import InputNumber from "../volt/InputNumber.vue";
import SecondaryButton from '../volt/SecondaryButton.vue';
import Alert from "./Alert.vue";

const kanjiData = kanjiTestStore()
const routerOpt = useRouter()
kanjiData.clearData()

const capData = ref(false)
const maxKanji = ref<undefined | number>(undefined)
const alertRef = ref<InstanceType<typeof Alert> | null>(null)
const selectedLevel = ref<string>("N5")
const selectedAll = ref(false)
const selectedVolumes = ref<Record<string, number[]>>({
    N5: [],
    N4: [],
    N3: [],
})

// Helper to check if all levels have all volumes selected
function isAllLevelsSelected() {
    if (Object.keys(volumes).every(level =>
        volumes[level]!.every(num => selectedVolumes.value[level]!.includes(num))
    )) {
        selectedAll.value = true
    } else {
        selectedAll.value = false
    }
}

function chooseLevel(level: string) {
    selectedLevel.value = level
}

function toggleVolume(vol: number) {
    if (selectedVolumes.value[selectedLevel.value]!.includes(vol)) {
        // Remove if selected
        (selectedVolumes.value[selectedLevel.value]!) = selectedVolumes.value[selectedLevel.value]!.filter(v => v !== vol)
    } else {
        // Add if not selected
        (selectedVolumes.value[selectedLevel.value]!).push(vol)
    }
    isAllLevelsSelected()
}

function arraysEqual(a: number[], b: number[]) {
    return a.length === b.length && b.every(val => b.includes(val));
}

function selectAllVolumes() {
    if (arraysEqual(selectedVolumes.value[selectedLevel.value]!, volumes[selectedLevel.value]!)) {
        selectedVolumes.value[selectedLevel.value] = [];
    } else {
        selectedVolumes.value[selectedLevel.value] = [...volumes[selectedLevel.value]!];
    }
    isAllLevelsSelected()
}

function selectAllVolumesLevel() {
    if (selectedAll.value) {
        selectedVolumes.value["N5"] = []
        selectedVolumes.value["N4"] = []
        selectedVolumes.value["N3"] = []
        selectedAll.value = false
    } else {
        selectedVolumes.value["N5"] = [...volumes["N5"]!]
        selectedVolumes.value["N4"] = [...volumes["N4"]!]
        selectedVolumes.value["N3"] = [...volumes["N3"]!]
        selectedAll.value = true
    }
}

function startKanjiTest() {
    const selectedKanjiVolumes = Object.entries(selectedVolumes.value)
        .flatMap(([level, vols]) => vols.map(vol => `/${level[1]}_${vol}.json`))
    kanjiData.setData(selectedKanjiVolumes, maxKanji.value)
    if (selectedKanjiVolumes.length != 0)
        routerOpt.push({ name: "test" })
    else
        alertRef.value?.show()
}

function blurFocus(event: Event) {
    (event.target as HTMLInputElement).blur()
}
</script>

<template>
    <Alert ref="alertRef" message="Minimal pilih satu volume"></Alert>
    <div class="flex flex-col justify-center items-center min-h-[100dvh] space-y-2.5 lg:space-y-4">
        <img src="/logo.png" class="mb-0 lg:mb-12" alt="logo" />
        <SecondaryButton @click="selectAllVolumesLevel" class="text-xs md:text-lg"
            :label="selectedAll ? 'Tidak Pilih Semua' : 'Pilih Semua'" variant="link" />

        <!-- Levels -->
        <div class="flex justify-center space-x-3 lg:space-x-6">
            <Button v-for="level in Object.keys(selectedVolumes)" :key="level" class="text-xs md:text-lg" :label="level"
                :variant="selectedLevel === level ? 'link' : 'outlined'" @click="chooseLevel(level)" />
        </div>

        <!-- Volumes (multi-select) -->
        <Card v-if="selectedLevel">
            <template #title>
                <div class="text-sm md:text-lg font-bold">
                    Pilih Volume ({{ selectedLevel }})
                </div>
            </template>
            <template #content>
                <div class="flex flex-col justify-center items-center space-y-4">
                    <SecondaryButton class="text-xs md:text-base"
                        :label="arraysEqual(selectedVolumes[selectedLevel]!, volumes[selectedLevel]!) ? 'Tidak Pilih Semua' : 'Pilih Semua'"
                        variant="link" @click="selectAllVolumes" />
                    <div class="flex justify-center space-x-2 lg:space-x-4 flex-wrap">
                        <Button v-for="vol in volumes[selectedLevel]" :key="vol" class="text-xs md:text-base"
                            :label="String(vol)"
                            :variant="selectedVolumes[selectedLevel]!.includes(vol) ? 'link' : 'outlined'"
                            @click="toggleVolume(vol)" />
                    </div>
                </div>
            </template>
        </Card>
        <div class="card flex flex-wrap items-center justify-center gap-2 mt-1">
            <Checkbox v-model="capData" binary @click="maxKanji = undefined" />
            <span class="text-sm lg:text-base">Batasi Jumlah Soal</span>
        </div>
        <div class="flex justify-center">
            <InputNumber v-model="maxKanji" class="input-small text-xs lg:text-base" @keyup.enter="blurFocus"
                @keyup.esc="blurFocus" :disabled="!capData" :use-grouping="false" :min="1" />
        </div>
        <div class="flex justify-center space-x-4">
            <Button @click="startKanjiTest" class="text-sm md:text-lg mt-8" label="Mulai Test" variant="link" />
            <SecondaryButton as="RouterLink" :to="{ name: 'study' }" class="text-sm md:text-lg mt-8"
                label="Lihat Daftar Kanji" variant="link" />
        </div>
    </div>
</template>

<style scoped>
.input-small ::v-deep(input) {
    width: 60px;
    max-width: 80px;
}
</style>
