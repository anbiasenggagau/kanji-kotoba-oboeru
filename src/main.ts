import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './components/Home.vue';
import KanjiStudy from './components/KanjiStudy.vue';
import KanjiTest from './components/KanjiTest.vue';
import Result from './components/Result.vue';
import './style.css';
import KanjiSearch from './components/KanjiSearch.vue';

const pinia = createPinia()
const router = createRouter({
    routes: [
        {
            path: "/",
            component: Home,
            name: "home"
        },
        {
            path: "/test",
            component: KanjiTest,
            name: "test"
        },
        {
            path: "/result",
            component: Result,
            name: "result"
        },
        {
            path: "/kanji",
            component: KanjiStudy,
            name: "study"
        },
        {
            path: "/search",
            component: KanjiSearch,
            name: "search"
        },
    ],
    history: createWebHistory(),
})

createApp(App)
    .use(router)
    .use(pinia)
    .use(PrimeVue, {
        unstyled: true
    })
    .mount('#app')