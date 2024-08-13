<template>
    <label v-if="label" class="label-text">{{ label }}</label>
    <input v-model="model" v-bind="{ ...$attrs }" :class="['input', props.class]" />
</template>
<script setup lang="ts">
interface Props {
    label?: string;
    class?: string;
}

const model = defineModel();
const props = withDefaults(defineProps<Props>(), {
    label: () => "",
    class: () => "input-bordered input-xs",
})
/*
    Either a :class prop or the attribute class can be used to style this component.
    The label has to specified with the :label prop.
*/
</script>
