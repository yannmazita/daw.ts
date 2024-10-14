<template>
    <div id="app-range-bar-container" class="flex">
        <input v-model="model" type="range"
            class="appearance-none w-full h-2 rounded-full bg-gray-200"
            :style="{ background: `linear-gradient(to right, #5bcefa 0%, #5bcefa ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)` }"
            :step="props.step" :min="props.min" :max="props.max">
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    min?: number;
    max?: number;
    step?: number;
}

const props = withDefaults(defineProps<Props>(), {
    min: () => 0,
    max: () => 100,
    step: () => 1,
});

const model = defineModel();

const percentage = computed(() => {
    return ((model.value - props.min) / (props.max - props.min)) * 100;
});
</script>

<style scoped>
.range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
}

.range::-moz-range-thumb {
    width: 0;
    height: 0;
    border: 0;
}
</style>
