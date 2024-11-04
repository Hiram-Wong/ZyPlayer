import { t } from '@/locales';
import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: t('pages.setting.table.header.name'),
    align: 'left',
    width: 150,
    colKey: 'name',
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: t('pages.setting.table.header.type'),
    align: 'left',
    colKey: 'type',
    width: 100,
  },
  { title: t('pages.setting.table.header.status'), align: 'left', colKey: 'isActive', width: 80 },
  {
    align: 'center',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: t('pages.setting.table.header.operate'),
  },
];
