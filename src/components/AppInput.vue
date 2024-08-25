<template>
    <!-- Input Field Component -->
    <!-- This component displays an optional label and an input field. -->
    <label v-if="label" class="label-text">{{ label }}</label>
    <input v-model="model" v-bind="{ ...$attrs }" :class="['input', props.class]" />
    <!-- Input field with dynamic classes and attributes -->
</template>

<script setup lang="ts">
import { defineModel, defineProps, withDefaults } from 'vue';

interface Props {
    label?: string;  // Optional label text for the input
    class?: string;  // Optional CSS class to style the input
}

const props = withDefaults(defineProps<Props>(), {
    label: () => "",  // Default label is an empty string if not provided
    class: () => "input-bordered input-xs",  // Default class for the input field
});

// Model binding for v-model on the input element
const model = defineModel();

/*
    This component accepts a 'label' and 'class' prop.
    - 'label': Optional text to display above the input.
    - 'class': Optional CSS class to add additional styling to the input.
    The component binds all other attributes ($attrs) passed to it, allowing for flexible reuse with different HTML input attributes.
*/
</script>
