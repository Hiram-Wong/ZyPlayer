import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';
import './permission';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(i18n);

// app.mount('#app');
app.mount('#app').$nextTick(window.removeLoading);
// app.mount('#app').$nextTick(() => {
//   setTimeout(() => {
//     window.removeLoading(); // 确保这个方法在全局作用域可访问
//   }, 1000); // 延迟1000毫秒（1秒）后执行
// });
