<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { flagStore } from '../store';
import type { KanjiType } from '../type';
import { volumes } from '../const';
import Button from '../volt/Button.vue';
import SecondaryButton from '../volt/SecondaryButton.vue';
import InputText from '../volt/InputText.vue';
import Card from '../volt/Card.vue';
import Message from '../volt/Message.vue';

onMounted(() => globalThis.addEventListener('keydown', previousKanjiEvent))
onMounted(() => globalThis.addEventListener('keydown', nextKanjiEvent))
onMounted(() => getKanjiData())
onBeforeUnmount(() => globalThis.removeEventListener('keydown', previousKanjiEvent))
onBeforeUnmount(() => globalThis.removeEventListener('keydown', nextKanjiEvent))

const flagData = flagStore()

const idx = ref(0)
const kanjiList = ref<KanjiType[]>([])
const kanjiData = ref<KanjiType | undefined>(undefined)
const loading = ref(true)
const search = ref("")
const inputFocus = ref(false)

const downloadedKanji: KanjiType[] = []

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
    if (!inputFocus.value) {
        const key = e.key.toLowerCase()
        if (key === 'a') {
            previousKanji()
        }
    }
}

function nextKanjiEvent(e: KeyboardEvent) {
    if (!inputFocus.value) {
        const key = e.key.toLowerCase()
        if ((key === 'd')) {
            nextKanji()
        }
    }
}

function blurFocus(event: Event) {
    (event.target as HTMLInputElement).blur()
}

function filterKanji(event: Event) {
    kanjiList.value = []
    kanjiData.value = undefined
    search.value = (event.target as HTMLInputElement).value
    if (search.value != "") {
        kanjiList.value = downloadedKanji.filter(val =>
            val.id.includes(search.value) ||
            val.kanji.includes(search.value) ||
            val.hiragana.includes(search.value) ||
            val.type.includes(search.value) ||
            val.enMeaning.toLowerCase().includes(search.value.toLowerCase()) ||
            val.idMeaning.toLowerCase().includes(search.value.toLowerCase())
        )
    }

    if (kanjiList.value.length != 0) {
        idx.value = 0
        kanjiData.value = kanjiList.value[idx.value]!
        loading.value = false
    }
}

async function getKanjiData() {
    const files: string[] = []
    for (const level in volumes) {
        for (const volumeNumb of volumes[level]!) {
            files.push(`${level[1]}_${volumeNumb}.json`)
        }
    }
    downloadedKanji.push(...(await Promise.all(
        files.map(file => fetch(file).then(r => r.json()))
    )).flat()
    )
    loading.value = false
}
</script>

<template>
    <div v-if="!loading" class="overflow-hidden">
        <div class="fixed top-2 lg:top-4 left-1/2 -translate-x-1/2 z-50">
            <div class="flex flex-col justify-center items-center">
                <Card>
                    <template #title>
                        <div class="flex justify-center items-center text-base md:text-lg font-bold">
                            Cari Kanji
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-col justify-center items-center">
                            <InputText ref="input-ref" @blur="inputFocus = false" @focus="inputFocus = true"
                                @keyup.enter="blurFocus" @keyup.esc="blurFocus" @input="filterKanji" variant="filled" />
                        </div>
                        <h1 class="items-center mt-2 lg:mt-4 text-center text-sm lg:text-base"> Ditemukan {{
                            kanjiList.length }}
                            Kanji</h1>
                    </template>
                </Card>
            </div>
        </div>

        <div class="flex flex-col justify-center items-center min-h-[100dvh]">
            <div v-if="kanjiData"
                class="flex flex-col justify-center items-center space-y-2 lg:space-y-4 pt-11 md:pt-8 lg:pt-6">
                <!-- Center Content -->
                <div class="relative flex items-center justify-center">
                    <!-- Flag Symbol -->
                    <div @click="flagData.checkKanjiExist(kanjiData.kanji) ? flagData.removeData(kanjiData.kanji) : flagData.pushData(kanjiData)"
                        class="absolute justify-center items-center top-0 -right-7 md:-right-9 text-gray-500 hover:text-gray-700 cursor-pointer">
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
                        <h1 class="items-center text-lg lg:text-xl font-bold" :key="idx + 1"> Kanji Ke {{ idx + 1 }}
                        </h1>
                    </Transition>
                </div>
                <Transition name="fade" mode="out-in">
                    <h1 class="items-center text-lg lg:text-xl font-bold" :key="idx + 1"> {{ kanjiData.id }}</h1>
                </Transition>
                <div class="relative">
                    <Transition name="fade" mode="out-in">
                        <h1 lang="ja" class="text-center text-[55px]/15 lg:text-7xl" :key="kanjiData.kanji">{{
                            kanjiData.kanji
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
            <div v-else-if="search.length != 0 && kanjiList.length == 0">
                <Message class="text-3xl" severity="error">Data Tidak Ditemukan</Message>
            </div>
            <div v-else>
                <Message class="small-message" severity="info">Masukkan Data</Message>
            </div>

            <!-- Bottom Content -->
            <div class="fixed bottom-18 lg:bottom-20 inset-x-0 flex justify-center bg-white">
                <SecondaryButton v-if="kanjiData" as="a" :href="`https://jisho.org/search/${kanjiData.kanji}`"
                    target="_blank" class="text-sm md:text-base" label="Lihat Penjelasan" />
            </div>
            <div class="fixed bottom-0 inset-x-0 flex justify-center bg-white py-4 shadow-lg">
                <Button as="RouterLink" class="text-sm md:text-base" :to="{ name: 'study' }"
                    label="Kembali Ke Daftar Kanji" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.small-message .v-message-text {
    font-size: 200px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>