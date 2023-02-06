import { getPermissionStore } from '@/store';
import router from '@/router';

const permissionStore = getPermissionStore();

router.beforeEach(async () => {
  await permissionStore.initRoutes(['all']);
});
