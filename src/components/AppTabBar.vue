<template>
    <!-- Tab Bar Component -->
    <!-- This component integrates volume control, navigation tabs, and a placeholder for future features. -->
    <div id="app-view-bar-container" class="grid grid-cols-3 items-center w-full p-2">
        <!-- Volume Control Section -->
        <div id="app-view-bar-master-volume-container" class="flex justify-self-start col-span-1">
            <AppMasterVolume></AppMasterVolume> <!-- Master volume component for overall application sound control -->
        </div>
        <!-- Navigation Tabs Section -->
        <div id="app-view-bar-panels-container" class="flex justify-self-center col-span-1">
            <AppTabSelection @current-tab="(tabName) => updateTab(tabName)" :tabs="tabNames"
                :defaultTab="defaultSelection">
            </AppTabSelection>
            <!-- Tab selection component that allows switching between different application views -->
        </div>
        <!-- Placeholder for Future Expansion -->
        <div id="app-view-bar-tbd-container" class="flex justify-self-end col-span-1">
            <div class="">
                <span>TBD</span> <!-- Placeholder text indicating area for future development -->
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

// Handles the change of tabs, routing to the appropriate view based on tab selection.
function updateTab(tab: string) {
    if (tab === "Tracker") {
        router.push({ name: 'Tracker' }); // Navigate to Tracker view
    } else if (tab === "Sequencer") {
        router.push({ name: 'Sequencer' }); // Navigate to Sequencer view
    }
}
</script>
