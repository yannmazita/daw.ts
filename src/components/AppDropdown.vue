<template>
    <div id="app-dropdown-wrapper" class="relative inline-block">
        <label v-if="props.label" class="text-[0.8em] mb-[0.2em] block">{{ props.label }}</label>
        <select v-model="model"
            class="appearance-none bg-gray-800 border border-gray-600 rounded text-white text-sm pl-4 pr-8 py-2 transition-all duration-300 ease-in-out cursor-pointer bg-no-repeat bg-[right_0.7rem_top_50%] bg-[length:1.5rem_auto] hover:shadow-[0_0_0_2px_rgba(66,153,225,0.5)] focus:shadow-[0_0_0_2px_rgba(66,153,225,0.5)] outline-none"
            :style="`background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 class=%27feather feather-chevron-down%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E');`">
            <option v-for="option in props.options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
const model = defineModel();

interface DropdownOption {
    value: string;
    label: string;
}
interface Props {
    options: DropdownOption[];
    label?: string;
}
const props = defineProps<Props>();
</script>
