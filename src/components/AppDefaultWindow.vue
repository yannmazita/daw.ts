<template>
    <div class="flex flex-col">
        <div v-for="(value, property) in filterProperties(currentWindow as object, excludeProperties)" :key="property">
            <span
                :class="{ 'text-red-500': changedProperties.has(property), 'text-black': !changedProperties.has(property) }">
                {{ property }}: {{ value }}
            </span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useWindowsStore } from '@/stores/useWindowsStore';
import { computed, ref, watch } from 'vue';
import { useFilter } from '@/composables/useFilter';
import { Window } from '@/utils/interfaces';

const props = defineProps<{
    id: string;
}>();

const windowsStore = useWindowsStore();
const currentWindow = computed(() => windowsStore.windows.get(props.id));
const { filterProperties } = useFilter();
const excludeProperties = ['windowComponent', 'windowComponentKey'];
const changedProperties = ref(new Set<string>());

watch(currentWindow, (newValue: Window | undefined, oldValue: Window | undefined) => {
    if (oldValue) {
        for (const key in newValue) {
            if (newValue[key] !== oldValue[key]) {
                changedProperties.value.add(key);
                setTimeout(() => {
                    changedProperties.value.delete(key);
                }, 500);
            }
        }
    }
}, { deep: true });
</script>
