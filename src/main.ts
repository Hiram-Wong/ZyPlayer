/* eslint-disable simple-import-sort/imports */
import { createApp } from 'vue';
import 'default-passive-events';

// import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

import { store } from './store';
import router from './router';
import '@/style/index.less';
import './permission';
import App from './App.vue';

const app = createApp(App);

// app.use(TDesign);
app.use(store);
app.use(router);

app.mount('#app');
