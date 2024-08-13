<template>
    <div class="flex flex-col justify-between h-full max-w-full">
        <component :is="visibleComponent" />
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
const visibleComponent = computed(() => {
    return null;
});
</script>
