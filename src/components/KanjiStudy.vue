<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { volumes } from '../const';
import { flagStore } from '../store';
import type { KanjiType } from '../type';
import Button from '../volt/Button.vue';
import Card from '../volt/Card.vue';
import DangerButton from '../volt/DangerButton.vue';
import SecondaryButton from '../volt/SecondaryButton.vue';

onMounted(() => globalThis.addEventListener('keydown', previousKanjiEvent))
onMounted(() => globalThis.addEventListener('keydown', nextKanjiEvent))
onMounted(() => getKanjiData("5_1.json"))
onBeforeUnmount(() => globalThis.removeEventListener('keydown', previousKanjiEvent))
onBeforeUnmount(() => globalThis.removeEventListener('keydown', nextKanjiEvent))

const flagData = flagStore()

const routerOpt = useRouter()

const selectedLevel = ref("N5")
const selectedVolume = ref(1)
const loading = ref(true)
const kanjiList = ref<KanjiType[]>([])
const idx = ref(0)
const kanjiData = ref<KanjiType>(kanjiList.value[idx.value]!)
const dynamicPadding = ref("")

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
    if (level == "Flagged") {
        getKanjiData("Flagged")
        dynamicPadding.value = "pt-11! md:pt-4"
    }
    else {
        getKanjiData(`${level[1]}_1.json`)
        dynamicPadding.value = ""
    }
}

function chooseVolume(volume: number) {
    selectedVolume.value = volume
    getKanjiData(`${selectedLevel.value[1]}_${volume}.json`)
}

async function removeFlaggedKanji(kanji: string) {
    flagData.removeData(kanji)
    if (selectedLevel.value == "Flagged") {
        kanjiList.value = await flagData.getKanji()
        previousKanji()
        if (Object.keys(flagData.flag).length == 0) {
            chooseLevel('N5')
        }
    }
}

async function getKanjiData(file: string) {
    let jsonData: KanjiType[] = []
    if (downloadedKanji[file] != undefined) {
        jsonData = downloadedKanji[file]
    } else if (file == "Flagged") {
        jsonData = await flagData.getKanji()
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

</script>

<template>
    <div v-if="!loading" class="overflow-hidden">
        <div class="fixed top-2 lg:top-4 left-1/2 -translate-x-1/2 z-50">
            <div class="flex justify-center space-x-2 lg:space-x-6 lg:mb-4">
                <Button v-for="level in Object.keys(volumes)" :key="level" class="text-xs md:text-lg" :label="level"
                    :variant="selectedLevel === level ? 'link' : 'outlined'" @click="chooseLevel(level)" />
            </div>
            <div class="flex justify-center mt-2">
                <Button class="text-xs md:text-lg" label="Flagged" :disabled="Object.keys(flagData.flag).length == 0"
                    :variant="selectedLevel === 'Flagged' ? 'link' : 'outlined'" @click="chooseLevel('Flagged')" />
            </div>

            <div v-if="volumes[selectedLevel]" class="flex justify-center">
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
            <div v-else class="flex justify-center mt-10 md:mt-13 lg:mt-16">
                <DangerButton class="text-xs md:text-lg" variant="link" label="Bersihkan Daftar Kanji"
                    @click="flagData.clearData(); chooseLevel('N5')" />
            </div>
        </div>

        <div class="flex flex-col justify-center items-center min-h-[100dvh]">
            <div class="flex flex-col justify-center items-center space-y-2 lg:space-y-4 pt-20 md:pt-8 lg:pt-6"
                :class="dynamicPadding">
                <!-- Center Content -->
                <div v-if="selectedLevel == 'Flagged'">
                    <Transition name="fade" mode="out-in">
                        <h1 class="text-lg lg:text-xl font-bold" :key="idx + 1"> Kanji Ke {{ idx + 1 }}
                        </h1>
                    </Transition>
                </div>
                <div class="relative flex items-center justify-center">
                    <!-- Flag Symbol -->
                    <div @click="flagData.checkKanjiExist(kanjiData.kanji) ? removeFlaggedKanji(kanjiData.kanji) : flagData.pushData(kanjiData)"
                        class="absolute -right-7 md:-right-10 text-gray-500 hover:text-gray-700 cursor-pointer">
                        <svg v-if="!flagData.checkKanjiExist(kanjiData.kanji)" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                            class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18m0-16h13l-1.5 4H3m0 0v12" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"
                            stroke="currentColor" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18m0-16h13l-1.5 4H3z" />
                        </svg>
                    </div>

                    <Transition name="fade" mode="out-in">
                        <h1 class="text-lg lg:text-xl font-bold" :key="idx + 1"> {{ selectedLevel != "Flagged" ? `Kanji
                            Ke
                            ${idx + 1}`
                            : kanjiData.id }}</h1>
                    </Transition>
                </div>
                <div class="relative">
                    <Transition name="fade" mode="out-in">
                        <h1 lang="ja" class="text-center text-5xl lg:text-7xl" :key="kanjiData.kanji">{{ kanjiData.kanji
                            }}
                        </h1>
                    </Transition>
                </div>
                <div class="flex flex-col justify-center items-center text-lg lg:text-3xl font-bold">
                    <Transition name="fade" mode="out-in">
                        <h2 :key="kanjiData.hiragana">{{ kanjiData.hiragana }}</h2>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <h2 class="text-xs lg:text-lg font-medium" :key="kanjiData.hiragana">{{ kanjiData.type }}</h2>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <h2 :key="kanjiData.hiragana">{{ kanjiData.idMeaning }}</h2>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <h2 class="text-sm lg:text-lg font-light" :key="kanjiData.hiragana">{{ kanjiData.enMeaning }}
                        </h2>
                    </Transition>
                </div>

                <div class="card flex justify-center">
                    <div class="flex space-x-2.5 lg:space-x-4">
                        <SecondaryButton class="text-sm md:text-base" @click="previousKanji(100)" label="<<<"
                            variant="outlined" />
                        <SecondaryButton class="text-sm md:text-base" @click="previousKanji(10)" label="<<"
                            variant="outlined" />
                        <SecondaryButton class="text-sm md:text-base lg:hidden px-3.5" @click="previousKanji()"
                            label="<" variant="outlined" />
                        <SecondaryButton class="text-sm md:text-base lg:hidden px-3.5" @click="nextKanji()" label=">"
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
            </div>

            <!-- Bottom Content -->
            <div
                class="fixed bottom-18 lg:bottom-20 inset-x-0 space-x-4 md:space-x-6 lg:space-x-8 flex justify-center bg-white">
                <SecondaryButton as="RouterLink" class="text-sm md:text-base" :to="{ name: 'search' }"
                    label="Cari Kanji & Kotoba" target="_blank" />
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
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>