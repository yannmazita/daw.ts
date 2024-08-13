<template>
    <div class="step flex flex-row justify-center items-center w-8 h-8 m-0.5 bg-gray-200 cursor-pointer border-solid border-4"
        :class="classes" @click="toggleStep">
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
interface Props {
    isActive: boolean;
    isPlaying: boolean;
}
const props = defineProps<Props>();
const classes = computed(() => ({
    'bg-ts-blue': props.isActive,
    'border-ts-blue': props.isActive && !props.isPlaying,
    'border-ts-pink': props.isPlaying
}));

const emit = defineEmits<{
    toggleActive: [value: void];
    togglePlaying: [value: void];
}>();

function toggleStep() {
    emit('toggleActive');
}
</script>
