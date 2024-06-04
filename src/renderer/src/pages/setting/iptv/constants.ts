import { t } from '@/locales';
import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: t('pages.setting.table.header.name'),
    colKey: 'name',
    width: 200,
    align: 'left',
    fixed: 'left',
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  {
    title: t('pages.setting.table.header.type'),
    align: 'left',
    colKey: 'type',
    filter: {
      type: 'multiple',
      resetValue: [],
      list: [
        { label: 'All', checkAll: true },
        { label: 'Remote', value: 'remote' },
        { label: 'Local', value: 'local' },
        { label: 'Manual', value: 'manual' },
      ],
      showConfirmAndReset: true,
    },
    width: 100,
  },
  { title: t('pages.setting.table.header.status'), align: 'left', colKey: 'isActive', width: 80 },
  {
    title: t('pages.setting.table.header.operate'),
    colKey: 'op',
    align: 'center',
    fixed: 'right',
    width: 200,
  },
];
