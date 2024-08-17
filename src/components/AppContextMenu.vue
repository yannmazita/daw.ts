<template>
    <div v-if="visible" :style="styleObject" class="fixed z-50 bg-white shadow-lg border-gray-200 border p-2"
        @click.outside="visible = false">
        <ul>
            <li v-for="(item, index) in props.items" :key="index" @click="handleClick(index)"
                class="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100">
                <img :src="item.icon" alt="" class="h-5 w-5">
                <span>{{ item.label }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, watchEffect, computed } from 'vue';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';

interface Props {
    items: Array<AppContextMenuItem>;
    x: number;
    y: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{
    'item-index': [index: number];
}>();

const visible: Ref<boolean> = ref(true);

watchEffect(() => {
    if (props.items.length > 0) {
        visible.value = true;
    }
});

function handleClick(index: number): void {
    props.items[index].performAction();
    emit('item-index', index);
    visible.value = false;
}

// Using tailwind classes to dynamically set arbitrary position values is annoying
const styleObject = computed(() => ({
    top: `${props.y}px`,
    left: `${props.x}px`,
}));
</script>
