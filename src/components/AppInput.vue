<template>
    <div class="app-input-wrapper">
        <label v-if="label" class="label-text">{{ label }}</label>
        <input v-model="model" v-bind="{ ...$attrs }" :class="['input', 'setting-input', props.class]"
            @focus="isFocused = true" @blur="isFocused = false" />
    </div>
</template>

<script setup lang="ts">
import { defineModel, defineProps, withDefaults, ref } from 'vue';

interface Props {
    label?: string;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: () => "",
    class: () => "input-bordered input-xs",
});

const model = defineModel();
const isFocused = ref(false);
</script>

<style scoped>
.app-input-wrapper {
    position: relative;
}

.setting-input {
    transition: all 0.3s ease;
}

.setting-input:focus {
    transform: scale(1.05);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.label-text {
    transition: all 0.3s ease;
    position: absolute;
    top: -1.5em;
    left: 0;
    font-size: 0.8em;
    opacity: 0.7;
}

.setting-input:focus+.label-text,
.setting-input:not(:placeholder-shown)+.label-text {
    transform: translateY(-0.5em);
    font-size: 0.7em;
    opacity: 1;
}

/*
    This component accepts a 'label' and 'class' prop.
    - 'label': Optional text to display above the input.
    - 'class': Optional CSS class to add additional styling to the input.
    The component binds all other attributes ($attrs) passed to it, allowing for flexible reuse with different HTML input attributes.
*/
</style>
