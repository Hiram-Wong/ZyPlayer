/* eslint-disable simple-import-sort/imports */
import { createApp } from 'vue';

import { print as consolePrint } from '@/utils/console';
import { dom as initDom } from '@/utils/setup';
import App from './App.vue';
import i18n from './locales';
import router from './router';
import { store } from './store';

import '@/style/index.less';
import 'tdesign-vue-next/es/style/index.css';

initDom();
consolePrint();

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);

app.mount('#app').$nextTick(window.removeLoading);
