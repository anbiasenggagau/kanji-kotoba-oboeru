<template>
    <div v-if="visible" class="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
        <slot>{{ message }}</slot>
        <button class="ml-4" @click="hide">X</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 2000
    }
})

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

// function to show the alert
function show() {
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
        visible.value = false
    }, props.duration)
}

// function to hide manually
function hide() {
    visible.value = false
    if (timer) clearTimeout(timer)
}

// expose to parent
defineExpose({ show, hide })
</script>
