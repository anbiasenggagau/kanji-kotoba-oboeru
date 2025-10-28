<template>
    <div class="outline-1 flex flex-col justify-center items-center">
        <h1 lang="ja" class="text-xl md:text-3xl lg:text-7xl text-center font-bold">{{ props.kanji }}</h1>
        <div class="flex flex-col justify-center items-center text-center text-base md:text-xl lg:text-3xl font-bold">
            <h2>{{ props.hiragana }}</h2>
            <h2>{{ props.meaning }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    kanji: {
        type: String,
        required: true,
    },
    hiragana: {
        type: String,
        required: true,
    },
    meaning: {
        type: String,
        required: true,
    },
})
</script>