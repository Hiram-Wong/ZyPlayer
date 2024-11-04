import { t } from '@/locales';
import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: t('pages.setting.table.header.name'),
    fixed: 'left',
    width: 150,
    ellipsis: true,
    align: 'left',
    colKey: 'name',
  },
  {
    title: t('pages.setting.table.header.type'),
    align: 'center',
    colKey: 'type',
    width: 130,
  },
  {
    title: t('pages.setting.table.header.group'),
    align: 'left',
    width: 100,
    ellipsis: true,
    colKey: 'group',
  },
  { title: t('pages.setting.table.header.status'), align: 'left', colKey: 'isActive', width: 80 },
  {
    align: 'center',
    fixed: 'right',
    width: 180,
    colKey: 'op',
    title: t('pages.setting.table.header.operate'),
  },
];
