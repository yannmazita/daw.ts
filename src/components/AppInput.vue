<template>
    <div class="relative inline-block">
        <label v-if="label" class="text-[0.8em] mb-[0.2em] block">{{ props.label }}</label>
        <input v-model="model" v-bind="{ ...$attrs }"
            :class="['appearance-none bg-gray-800 border border-gray-600 rounded text-white text-sm p-2 transition-all duration-300 ease-in-out hover:shadow-[0_0_0_2px_rgba(66,153,225,0.5)] focus:shadow-[0_0_0_2px_rgba(66,153,225,0.5)] outline-none', 'setting-input', props.class]" />
    </div>
</template>

<script setup lang="ts">
const model = defineModel();

interface Props {
    label?: string;
    class?: string;
}
const props = withDefaults(defineProps<Props>(), {
    label: () => "",
    class: () => "border border-gray-300 p-2 rounded text-xs",
});

/*
    This component accepts a 'label' and 'class' prop.
    - 'label': Optional text to display above the input.
    - 'class': Optional CSS class to add additional styling to the input.
    The component binds all other attributes ($attrs) passed to it, allowing for flexible reuse with different HTML input attributes.
*/
</script>
