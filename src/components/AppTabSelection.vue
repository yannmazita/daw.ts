<template>
    <!-- Tab Selection Component -->
    <!-- Displays a list of tabs that users can click to switch views or content. -->
    <div id="app-tab-selection-container" role="tablist" class="tabs tabs-bordered">
        <!-- Iterates over provided tabs and creates clickable tab elements -->
        <a v-for="tab in props.tabs" role="tab" class="tab" :ref="addRef" @click="setActiveTab(tab)">
            {{ tab }}
        </a>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';

interface Props {
    tabs: string[]; // Array of strings representing the tab names
    defaultTab: string; // The name of the tab to be activated by default
}
const props = defineProps<Props>();
const tabRefs: Ref<HTMLAnchorElement>[] = []; // Array to store references to tab elements
const activeTab: Ref<string> = ref(''); // Reactive property to keep track of the current active tab

const emit = defineEmits<{
    currentTab: [value: string];
}>();

// Function to add references to the DOM elements of tabs for manipulation
function addRef(element: unknown) {
    if (element instanceof HTMLAnchorElement) {
        tabRefs.push(ref(element));
    }
};

// Function to set the active tab, add 'tab-active' class to it, and emit an event
function setActiveTab(tab: string): void {
    tabRefs.forEach((ref) => {
        if (ref.value.textContent == tab) {
            ref.value.classList.add('tab-active'); // Add active class to the current tab
            activeTab.value = tab; // Set the current active tab
            emit('currentTab', tab); // Emit the currentTab event with the active tab
        }
        else {
            ref.value.classList.remove('tab-active'); // Remove active class from non-active tabs
        }
    });
}

// Function to set the default tab as active using the setActiveTab function
function setDefaultTab(): void {
    setActiveTab(props.defaultTab);
}

// Lifecycle hook that sets the default tab when the component is mounted
onMounted(() => {
    setDefaultTab();
});
</script>
