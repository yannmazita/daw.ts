<template>
    <div id="app-tab-selection-container" role="tablist" class="tabs tabs-bordered">
        <a v-for="tab in props.tabs" role="tab" class="tab" :ref="addRef" @click="setActiveTab(tab)">
            {{ tab }}
        </a>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';

interface Props {
    tabs: string[];
    defaultTab: string;
}
const props = defineProps<Props>();
const tabRefs: Ref<HTMLAnchorElement>[] = [];
const activeTab: Ref<string> = ref('');

const emit = defineEmits<{
    currentTab: [value: string];
}>();

function addRef(element: unknown) {
    if (element instanceof HTMLAnchorElement) {
        tabRefs.push(ref(element));
    }
};

function setActiveTab(tab: string): void {
    tabRefs.forEach((ref) => {
        if (ref.value.textContent == tab) {
            ref.value.classList.add('tab-active');
            activeTab.value = tab;
            emit('currentTab', tab);
        }
        else {
            ref.value.classList.remove('tab-active');
        }
    });
}

function setDefaultTab(): void {
    setActiveTab(props.defaultTab);
}

onMounted(() => {
    setDefaultTab();
});
</script>
