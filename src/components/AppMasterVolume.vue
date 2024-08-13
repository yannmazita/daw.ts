<template>
    <div id="app-master-volume-container" class="flex flew-row items-center">
        <AppRangeBar v-model="rangeValue" class="" :step="5" :max="100"></AppRangeBar>
        <AppSmallButton @click="toggleMute">{{ volumeIcon }}</AppSmallButton>
        <div>{{ rangeValue }}</div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, computed, watch, ref, Ref } from 'vue';
import { useAppStore } from '@/stores/app.ts';
import { storeToRefs } from 'pinia';
import AppRangeBar from '@/components/AppRangeBar.vue';
import AppSmallButton from '@/components/AppSmallButton.vue';

const { masterVolume } = storeToRefs(useAppStore());
const rangeValue: Ref<number> = ref(0);
const volumeBeforeMute: Ref<number> = ref(0);
const volumeIcon = computed<string>(() => {
    if (rangeValue.value == 0) {
        return '🔇';
    }
    else if (rangeValue.value > 0 && rangeValue.value < 33) {
        return '🔈';
    }
    else if (rangeValue.value > 0 && rangeValue.value < 66) {
        return '🔉';
    }
    else {
        return '🔊';
    }
});

function toggleMute(): void {
    if (rangeValue.value != 0) {
        volumeBeforeMute.value = rangeValue.value;
        rangeValue.value = 0;
    }
    else {
        rangeValue.value = volumeBeforeMute.value;
    }
}

onMounted(() => {
    rangeValue.value = masterVolume.value;
});
watch(rangeValue, (newValue) => {
    masterVolume.value = newValue;
});
</script>
