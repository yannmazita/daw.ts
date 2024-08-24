<template>
    <div id="sequencer-track-settings-dialog-instruments-content-container">
        <h3>Instruments per Track</h3>
        <ul>
            <li v-for="(instrument, index) in instruments" :key="index">
                Track {{ index }}: {{ instrument.name }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { sequencerInstrumentManagerKey } from '@/utils/injection-keys';

const sequencerInstrumentManager = inject(sequencerInstrumentManagerKey);

const instruments = sequencerInstrumentManager ? sequencerInstrumentManager.trackInstruments : [];
</script>
