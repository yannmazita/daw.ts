<template>
    <div id="app-view-bar-container" class="grid grid-cols-3 items-center w-full p-2">
        <div id="app-view-bar-master-volume-container" class="flex justify-self-start col-span-1">
            <AppMasterVolume></AppMasterVolume>
        </div>
        <div id="app-view-bar-panels-container" class="flex justify-self-center col-span-1">
            <AppTabSelection @current-tab="(tabName) => updateTab(tabName)" :tabs="tabNames"
                :defaultTab="defaultSelection">
            </AppTabSelection>
        </div>
        <div id="app-view-bar-tbd-container" class="flex justify-self-end col-span-1">
            <div class="">
                <span>TBD</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppMasterVolume from '@/components/AppMasterVolume.vue';
import AppTabSelection from '@/components/AppTabSelection.vue';

const router = useRouter();
const tabNames: string[] = ["Tracker", "Sequencer"];
const defaultSelection: string = tabNames[0];

function updateTab(tab: string) {
    if (tab == "Tracker") {
        router.push({ name: 'Tracker' });
    }
    else if (tab == "Sequencer") {
        router.push({ name: 'Sequencer' });
    }
}
</script>
