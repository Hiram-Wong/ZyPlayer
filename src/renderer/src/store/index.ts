import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(createPersistedState());

export { store };

export * from './modules/permission';
export * from './modules/play';
export * from './modules/setting';
export * from './modules/tabs-router';

export default store;
