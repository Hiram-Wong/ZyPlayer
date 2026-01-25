import { computed } from 'vue';

import { t } from '@/locales';

export const COLUMNS = computed(() => [
  {
    type: 'multiple',
    fixed: 'left',
    colKey: 'row-select',
  },
  {
    title: t('common.name'),
    align: 'left',
    colKey: 'name',
    ellipsis: true,
  },
  {
    title: t('common.type'),
    align: 'center',
    colKey: 'type',
    ellipsis: true,
  },
  {
    title: t('common.group'),
    align: 'center',
    colKey: 'group',
    ellipsis: true,
  },
  {
    title: t('common.status'),
    align: 'center',
    colKey: 'isActive',
  },
  {
    title: t('common.operate'),
    align: 'center',
    fixed: 'right',
    width: 230,
    colKey: 'op',
  },
]);
