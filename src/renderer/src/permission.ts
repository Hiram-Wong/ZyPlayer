import router from '@/router';
import { getPermissionStore } from '@/store';

router.beforeEach(async () => {
  const permissionStore = getPermissionStore();

  await permissionStore.initRoutes();
});
