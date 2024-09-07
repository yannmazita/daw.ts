<template>
    <div id="app-range-bar-container" class="flex">
        <input v-model="model" type="range" class="range [--range-shdw:#5bcefa]" :step="props.step" :max="props.max">
    </div>
</template>
<script setup lang="ts">
interface Props {
    max?: number;
    step?: number;
}
const props = withDefaults(defineProps<Props>(), {
    max: () => 100,
    step: () => 1,
});

const model = defineModel();
</script>
