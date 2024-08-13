import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import './style.css';
import App from '@/App.vue';

import HomeView from '@/views/HomeView.vue';
import SettingsView from '@/views/SettingsView.vue';
import TrackerView from '@/views/TrackerView.vue';
import SequencerView from '@/views/SequencerView.vue';

const pinia = createPinia()
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/tracker',
            name: 'Tracker',
            component: TrackerView
        },
        {
            path: '/sequencer',
            name: 'Sequencer',
            component: SequencerView
        },
        {
            path: '/home',
            name: 'Home',
            component: HomeView
        },
        {
            path: '/settings',
            name: 'Settings',
            component: SettingsView
        },
    ]
})

createApp(App).use(router).use(pinia).mount('#app')
