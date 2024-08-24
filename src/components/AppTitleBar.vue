<template>
    <div class="flex justify-between items-center p-2 bg-blue-500 text-white">
        <h2>{{ props.title }}</h2>
        <button @click="handleClose" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
            Close
        </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
    title?: string;
}
const props = withDefaults(defineProps<Props>(), {
    title: () => 'Dialog Title',
});

const emit = defineEmits(['close']);

function handleClose() {
    emit('close')
}
</script>
