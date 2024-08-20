<template>
    <div class="sequencer-track-settings-container">
        <dialog class="modal" :class="{ 'modal-open': ui.sequencerTrackSettingsDialogVisible }">
            <div class="modal-box">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        @click="ui.toggleSequencerTrackSettingsDialog()">✕</button>
                </form>
                <h3 class="text-lg font-bold">Track settings</h3>
                <p class="py-4">Some settings</p>
            </div>
        </dialog>
    </div>
</template>
<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore';

const ui = useUIStore();
</script>
