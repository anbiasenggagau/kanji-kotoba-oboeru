<script setup lang="ts">
import ConfirmDialog from './volt/ConfirmDialog.vue';
import Toast from './volt/Toast.vue';

</script>

<template>
  <RouterView />
  <ConfirmDialog />
  <Toast class="w-full max-w-[calc(100vw-2rem)] sm:w-[25rem] left-0 right-0 mx-auto sm:mx-0" />
</template>