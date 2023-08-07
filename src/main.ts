/* eslint-disable simple-import-sort/imports */
import { createApp } from 'vue';
import 'default-passive-events';

// import TDesign from 'tdesign-vue-next';
import App from './App.vue';
import router from './router';
import { store } from './store';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';
import './permission';

const app = createApp(App);

// app.use(TDesign);
app.use(store);
app.use(router);

app.mount('#app');
