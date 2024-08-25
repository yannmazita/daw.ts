<template>
    <!-- Title Bar Component -->
    <!-- Displays a title bar with a close button. The title can be set dynamically through props. -->
    <div class="flex justify-between items-center p-2 bg-blue-500 text-white">
        <h2>{{ props.title }}</h2> <!-- Displays the title passed as a prop -->
        <button @click="handleClose" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
            Close
        </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
    title?: string; // Title can be optionally provided, defaults to 'Dialog Title'
}
const props = withDefaults(defineProps<Props>(), {
    title: () => 'Dialog Title', // Default title if none provided
});

const emit = defineEmits(['close']);

// Function to handle the close action, emits the 'close' event to the parent component
function handleClose() {
    emit('close');
}
</script>
