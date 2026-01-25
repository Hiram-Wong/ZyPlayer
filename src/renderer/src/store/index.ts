import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { PiniaSharedState } from 'pinia-shared-state';

const store = createPinia();
store.use(createPersistedState({ auto: true }));
store.use(PiniaSharedState({ type: 'native' }));

export { store };

export * from './modules/browser';
export * from './modules/player';
export * from './modules/setting';

export default store;
