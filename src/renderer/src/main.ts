import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(i18n);

app.mount('#app').$nextTick(window.removeLoading);
