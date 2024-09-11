import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import { createSyncPlugin } from './plugins/pinia-plugin-sync';

const store = createPinia();
store.use(createPersistedState());
store.use(createSyncPlugin());

export { store };

export * from './modules/permission';
export * from './modules/play';
export * from './modules/setting';

export default store;
