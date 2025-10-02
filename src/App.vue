<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Button from './volt/Button.vue';
import DangerButton from './volt/DangerButton.vue';
import SecondaryButton from './volt/SecondaryButton.vue';

type KanjiType = {
  kanji: string
  hiragana: string
  meaning: string
}

const loading = ref(true)
const kanjiList = ref<KanjiType[]>([])
const totalKanji = ref(0)
const questNum = ref(1)
const correctAnswer = ref<KanjiType[]>([])
const wrongAnswer = ref<KanjiType[]>([])
const idx = ref(Math.floor(Math.random() * totalKanji.value))
const kanjiData = ref<KanjiType>(kanjiList.value[idx.value]!)
const answer = ref("text-white")
const revealButton = ref(true)

function revealAnswer() {
  answer.value = "text-black transition delay-150 duration-300"
  revealButton.value = false
}

function nextKanji(callback: () => void) {
  if (kanjiList.value.length == 1) callback()

  kanjiList.value.splice(idx.value, 1);
  if (kanjiList.value.length > 0) {
    callback()
    questNum.value++
    idx.value = Math.floor(Math.random() * kanjiList.value.length);
    kanjiData.value = kanjiList.value[idx.value]!;
    answer.value = "text-white";
    revealButton.value = true;
  }
}

function addCorrectAnswer() {
  function callback() {
    correctAnswer.value.push(kanjiData.value)
  }
  nextKanji(callback)
}

function addWrongAnswer() {
  function callback() {
    wrongAnswer.value.push(kanjiData.value)
  }
  nextKanji(callback)
}

function wrongAnswerEvent(e: KeyboardEvent) {
  if (!revealButton.value && e.key.toLowerCase() === 'a') {
    addWrongAnswer()
  }
}

function correctAnswerEvent(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (!revealButton.value && (key === 'd')) {
    addCorrectAnswer()
  }
}

function revealAnswerEvent(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (revealButton.value && (key === ' ' || key === 's')) {
    revealAnswer()
  }
}

async function initData() {
  const files = ["/5_1.json", "/5_2.json", "/5_3.json", "/5_4.json", "/5_5.json"]
  const results = await Promise.all(
    files.map(file => fetch(file).then(r => r.json()))
  )

  kanjiList.value = results.flat()
  totalKanji.value = kanjiList.value.length
  idx.value = Math.floor(Math.random() * kanjiList.value.length)
  kanjiData.value = kanjiList.value[idx.value]!
  loading.value = false
}

onMounted(() => window.addEventListener('keydown', wrongAnswerEvent))
onMounted(() => window.addEventListener('keydown', correctAnswerEvent))
onMounted(() => window.addEventListener('keydown', revealAnswerEvent))
onMounted(() => initData())
onBeforeUnmount(() => window.removeEventListener('keydown', wrongAnswerEvent))
onBeforeUnmount(() => window.removeEventListener('keydown', correctAnswerEvent))
onBeforeUnmount(() => window.removeEventListener('keydown', revealAnswerEvent))
</script>

<template>
  <div v-if="!loading">
    <!-- Floating text -->
    <div class="fixed top-4 left-4 z-50 text-2xl font-bold">
      Jawaban Benar {{ correctAnswer.length }}/{{ totalKanji }}
    </div>

    <!-- Center Content -->
    <div class="flex flex-col justify-center items-center min-h-screen space-y-4">
      <h1 class="text-3xl font-bold"> Soal Ke {{ questNum }}</h1>
      <h1 class="text-7xl font-bold">{{ kanjiData.kanji }}</h1>
      <div class="flex flex-col justify-center items-center text-3xl font-bold">
        <h2 v-bind:class="answer">{{ kanjiData.hiragana }}</h2>
        <h2 v-bind:class="answer">{{ kanjiData.meaning }}</h2>
      </div>

      <div class="card flex justify-center">
        <Transition name="fade" mode="out-in">
          <template v-if="revealButton">
            <SecondaryButton key="reveal" label="Lihat Jawaban" @click="revealAnswer" />
          </template>
          <template v-else>
            <div key="mark" class="flex space-x-4">
              <DangerButton @click="addWrongAnswer" label="Tandai Sebagai Salah" variant="outlined" />
              <Button @click="addCorrectAnswer" label="Tandai Sebagai Benar" variant="outlined" />
            </div>
          </template>
        </Transition>
      </div>

      <div class="card flex justify-center">
        <Transition name="fade" mode="out-in">
          <template v-if="revealButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
              <path
                d="M160 221.5C160 152.2 216.2 96 285.5 96L432 96C449.7 96 464 110.3 464 128C464 145.7 449.7 160 432 160L285.5 160C251.5 160 224 187.5 224 221.5C224 252.5 247.1 278.7 277.9 282.5L370.1 294C432.9 301.9 480 355.2 480 418.5C480 487.8 423.8 544 354.5 544L208 544C190.3 544 176 529.7 176 512C176 494.3 190.3 480 208 480L354.5 480C388.5 480 416 452.5 416 418.5C416 387.5 392.9 361.3 362.1 357.5L269.9 346C207.1 338.1 160 284.8 160 221.5z" />
            </svg>
          </template>
          <template v-else>
            <div class="flex space-x-40">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
                <path
                  d="M349.5 115.7C344.6 103.8 332.9 96 320 96C307.1 96 295.4 103.8 290.5 115.7C197.2 339.7 143.8 467.7 130.5 499.7C123.7 516 131.4 534.7 147.7 541.5C164 548.3 182.7 540.6 189.5 524.3L221.3 448L418.6 448L450.4 524.3C457.2 540.6 475.9 548.3 492.2 541.5C508.5 534.7 516.2 516 509.4 499.7C496.1 467.7 442.7 339.7 349.4 115.7zM392 384L248 384L320 211.2L392 384z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
                <path
                  d="M128 128C128 110.3 142.3 96 160 96L288 96C411.7 96 512 196.3 512 320C512 443.7 411.7 544 288 544L160 544C142.3 544 128 529.7 128 512L128 128zM192 160L192 480L288 480C376.4 480 448 408.4 448 320C448 231.6 376.4 160 288 160L192 160z" />
              </svg>
            </div>
          </template>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* we will explain what these classes do next! */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>