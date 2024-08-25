<template>
    <!-- Master Volume Control Component -->
    <!-- Allows the user to adjust the master volume and mute/unmute -->
    <div id="app-master-volume-container" class="flex flex-row items-center">
        <!-- Volume slider component -->
        <AppRangeBar v-model="rangeValue" class="" :step="5" :max="100"></AppRangeBar>
        <!-- Button to toggle mute/unmute -->
        <AppSmallButton class="mx-1" @click="toggleMute">{{ volumeIcon }}</AppSmallButton>
        <!-- Display of the current volume level -->
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

// Local state for the volume slider value
const rangeValue: Ref<number> = ref(0);

// Temporary storage for the volume before muting
const volumeBeforeMute: Ref<number> = ref(0);

const volumeIcon = computed<string>(() => {
    if (rangeValue.value == 0) {
        return '🔇'; // Muted icon
    } else if (rangeValue.value < 33) {
        return '🔈'; // Low volume icon
    } else if (rangeValue.value < 66) {
        return '🔉'; // Medium volume icon
    } else {
        return '🔊'; // High volume icon
    }
});

function toggleMute(): void {
    if (rangeValue.value != 0) {
        volumeBeforeMute.value = rangeValue.value;
        rangeValue.value = 0; // Mute the volume
    } else {
        rangeValue.value = volumeBeforeMute.value; // Restore the previous volume
    }
}

// Sync the slider value with the store value on component mount
onMounted(() => {
    rangeValue.value = masterVolume.value;
});

// Watch the local volume slider value to update the store
watch(rangeValue, (newValue) => {
    masterVolume.value = newValue;
});
</script>
