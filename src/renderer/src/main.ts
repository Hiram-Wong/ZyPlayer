/* eslint-disable simple-import-sort/imports */
import { createApp } from 'vue';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';

import { print as consolePrint } from '@/utils/console';
import { dom as initDom } from '@/utils/setup';
import App from './App.vue';
import i18n from './locales';
import router from './router';
import { store } from './store';
import { setApiToken } from './utils/request/auth';

import '@/style/index.less';
import 'tdesign-vue-next/es/style/index.css';

const bootstrap = async () => {
  const token = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.API_SERVER_TOKEN);
  setApiToken(token);

  initDom();
  consolePrint();

  const app = createApp(App);
  app.use(store);
  app.use(router);
  app.use(i18n);

  app.mount('#app').$nextTick(window.removeLoading);
};

void bootstrap();
