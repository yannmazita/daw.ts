import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export const useDialogStore = defineStore('dialog', () => {
    const sequencerTrackSettingsDialogVisible: Ref<boolean> = ref(false);

    function toggleSequencerTrackSettingsDialog() {
        sequencerTrackSettingsDialogVisible.value = !sequencerTrackSettingsDialogVisible.value;
    }

    return {
        sequencerTrackSettingsDialogVisible,
        toggleSequencerTrackSettingsDialog,
    };
});
