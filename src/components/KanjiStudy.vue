<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { volumes } from '../const';
import type { KanjiType } from '../type';
import Button from '../volt/Button.vue';
import Card from '../volt/Card.vue';
import SecondaryButton from '../volt/SecondaryButton.vue';

onMounted(() => globalThis.addEventListener('keydown', previousKanjiEvent))
onMounted(() => globalThis.addEventListener('keydown', nextKanjiEvent))
onMounted(() => getKanjiData("5_1.json"))
onBeforeUnmount(() => globalThis.removeEventListener('keydown', previousKanjiEvent))
onBeforeUnmount(() => globalThis.removeEventListener('keydown', nextKanjiEvent))

const routerOpt = useRouter()

const selectedLevel = ref("N5")
const selectedVolume = ref(1)
const loading = ref(true)
const kanjiList = ref<KanjiType[]>([])
const idx = ref(0)
const kanjiData = ref<KanjiType>(kanjiList.value[idx.value]!)

const downloadedKanji: Record<string, KanjiType[]> = {}

function nextKanji(jump: number | "max" = 1) {
    if (jump == 'max') {
        idx.value = kanjiList.value.length - 1
        kanjiData.value = kanjiList.value[idx.value]!
    } else {
        idx.value = Math.min(idx.value + jump, kanjiList.value.length - 1)
        kanjiData.value = kanjiList.value[idx.value]!
    }
}

function previousKanji(jump: number | "min" = 1) {
    if (jump == "min") {
        idx.value = 0
        kanjiData.value = kanjiList.value[idx.value]!
    } else {
        idx.value = Math.max(idx.value - jump, 0)
        kanjiData.value = kanjiList.value[idx.value]!
    }
}


function previousKanjiEvent(e: KeyboardEvent) {
    const key = e.key.toLowerCase()
    if (key === 'a') {
        previousKanji()
    }
}

function nextKanjiEvent(e: KeyboardEvent) {
    const key = e.key.toLowerCase()
    if ((key === 'd')) {
        nextKanji()
    }
}

function chooseLevel(level: string) {
    selectedLevel.value = level
    selectedVolume.value = 1
    initializeKanjiData(level)
}

function chooseVolume(volume: number) {
    selectedVolume.value = volume
    getKanjiData(`${selectedLevel.value[1]}_${volume}.json`)
}

async function getKanjiData(file: string) {
    let jsonData: KanjiType[] = []
    if (downloadedKanji[file] != undefined) {
        jsonData = downloadedKanji[file]
    } else {
        const resp = await fetch(file)
        jsonData = await resp.json()
        if (jsonData.length == 0)
            routerOpt.replace({ name: "home" })
        downloadedKanji[file] = jsonData
    }

    kanjiList.value = jsonData
    idx.value = 0
    kanjiData.value = kanjiList.value[idx.value]!
    loading.value = false
}

async function initializeKanjiData(level: string) {
    await getKanjiData(`${level[1]}_1.json`)
}

</script>

<template>
    <div v-if="!loading">
        <div class="fixed top-2 lg:top-4 left-1/2 -translate-x-1/2 z-50">
            <div class="flex justify-center space-x-2 lg:space-x-6 lg:mb-4">
                <Button v-for="level in Object.keys(volumes)" :key="level" class="text-xs md:text-lg" :label="level"
                    :variant="selectedLevel === level ? 'link' : 'outlined'" @click="chooseLevel(level)" />
            </div>

            <div class="flex justify-center">
                <Card>
                    <template #title>
                        <div class="text-xs md:text-lg font-bold">
                            Pilih Volume
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-col justify-center items-center">
                            <div class="flex justify-center space-x-2 lg:space-x-4">
                                <Button v-for="vol in volumes[selectedLevel]" :key="vol" class="text-xs md:text-base"
                                    :label="String(vol)" :variant="selectedVolume == vol ? 'link' : 'outlined'"
                                    @click="chooseVolume(vol)" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Center Content -->
        <div class="flex flex-col justify-center items-center min-h-[100dvh] space-y-4 pt-8 lg:pt-6">
            <Transition name="fade" mode="out-in">
                <h1 class="text-lg lg:text-3xl font-bold" :key="idx + 1"> Kanji Ke {{ idx + 1 }}</h1>
            </Transition>
            <Transition name="fade" mode="out-in">
                <h1 class="text-6xl lg:text-7xl font-bold" :key="kanjiData.kanji">{{ kanjiData.kanji }}</h1>
            </Transition>
            <div key="meaning" class="flex flex-col justify-center items-center text-lg lg:text-3xl font-bold">
                <Transition name="fade" mode="out-in">
                    <h2 :key="kanjiData.hiragana">{{ kanjiData.hiragana }}</h2>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <h2 :key="kanjiData.hiragana">{{ kanjiData.meaning }}</h2>
                </Transition>
            </div>

            <div class="card flex justify-center">
                <div key="mark" class="flex space-x-2.5 lg:space-x-4">
                    <SecondaryButton class="text-sm md:text-base" @click="previousKanji(100)" label="<<<"
                        variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base" @click="previousKanji(10)" label="<<"
                        variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base lg:hidden" @click="previousKanji()" label="<"
                        variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base lg:hidden" @click="nextKanji()" label=">"
                        variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base hidden! lg:inline-flex!" @click="previousKanji()"
                        label="Kanji Sebelumnya" variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base hidden! lg:inline-flex!" @click="nextKanji()"
                        label="Kanji Selanjutnya" variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base" @click="nextKanji(10)" label=">>"
                        variant="outlined" />
                    <SecondaryButton class="text-sm md:text-base" @click="nextKanji(100)" label=">>>"
                        variant="outlined" />
                </div>
            </div>

            <div class="card hidden lg:flex justify-center space-x-35">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
                    <path
                        d="M349.5 115.7C344.6 103.8 332.9 96 320 96C307.1 96 295.4 103.8 290.5 115.7C197.2 339.7 143.8 467.7 130.5 499.7C123.7 516 131.4 534.7 147.7 541.5C164 548.3 182.7 540.6 189.5 524.3L221.3 448L418.6 448L450.4 524.3C457.2 540.6 475.9 548.3 492.2 541.5C508.5 534.7 516.2 516 509.4 499.7C496.1 467.7 442.7 339.7 349.4 115.7zM392 384L248 384L320 211.2L392 384z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
                    <path
                        d="M128 128C128 110.3 142.3 96 160 96L288 96C411.7 96 512 196.3 512 320C512 443.7 411.7 544 288 544L160 544C142.3 544 128 529.7 128 512L128 128zM192 160L192 480L288 480C376.4 480 448 408.4 448 320C448 231.6 376.4 160 288 160L192 160z" />
                </svg>
            </div>

            <!-- Bottom Content -->
            <div class="fixed bottom-10 lg:bottom-12 inset-x-0 flex justify-center bg-white py-4 shadow-lg">
                <SecondaryButton as="a" :href="`https://jisho.org/search/${kanjiData.kanji}`" target="_blank"
                    class="text-sm md:text-base" label="Lihat Penjelasan" />
            </div>
            <div class="fixed bottom-0 inset-x-0 flex justify-center bg-white py-4 shadow-lg">
                <Button as="RouterLink" class="text-sm md:text-base" :to="{ name: 'home' }"
                    label="Selesaikan & Kembali Ke Beranda" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* we will explain what these classes do next! */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>