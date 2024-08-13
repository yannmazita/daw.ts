import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    const masterVolume: Ref<number> = ref(0);

    return {
        masterVolume,
    }
})

