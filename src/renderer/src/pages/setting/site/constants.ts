import { t } from '@/locales';
import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: t('pages.setting.table.header.name'),
    fixed: 'left',
    width: 100,
    ellipsis: true,
    align: 'left',
    colKey: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  {
    title: t('pages.setting.table.header.resource'),
    align: 'left',
    width: 100,
    colKey: 'resource',
  },
  { title: t('pages.setting.table.header.search'), align: 'left', colKey: 'search', width: 90 },
  {
    title: t('pages.setting.table.header.type'),
    align: 'center',
    colKey: 'type',
    filter: {
      type: 'multiple',
      resetValue: [],
      list: [
        { label: 'All', checkAll: true },
        { label: 'cms[xml]', value: 0 },
        { label: 'cms[json]', value: 1 },
        { label: 'drpy[js0]', value: 2 },
        { label: 'hipy[t4]', value: 6 },
        { label: 'js[t3]', value: 7 },
        { label: 'catvod[nodejs]', value: 8 },
        { label: 'app[v3]', value: 3 },
        { label: 'app[v1]', value: 4 },
      ],
      showConfirmAndReset: true,
    },
    width: 130,
  },
  {
    title: t('pages.setting.table.header.group'),
    align: 'left',
    width: 100,
    ellipsis: true,
    colKey: 'group',
    sorter: (a, b) => a.group.localeCompare(b.group, 'zh-Hans-CN'),
  },
  { title: t('pages.setting.table.header.status'), align: 'left', colKey: 'isActive', width: 80 },
  {
    align: 'center',
    fixed: 'right',
    width: 220,
    colKey: 'op',
    title: t('pages.setting.table.header.operate'),
  },
];
