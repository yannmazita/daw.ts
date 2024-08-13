<template>
    <div id="app-range-bar-container" class="flex">
        <AppInput v-model="model" type="range" :class="'range range-secondary'" :step="props.step" :max="props.max">
        </AppInput>
    </div>
</template>
<script setup lang="ts">
import AppInput from '@/components/AppInput.vue';

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
