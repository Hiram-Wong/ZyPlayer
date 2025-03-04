import { t } from '@/locales';
import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  {
    type: 'multiple',
    fixed: 'left',
    colKey: 'row-select',
  },
  {
    title: t('pages.setting.table.header.name'),
    align: 'left',
    colKey: 'name',
    ellipsis: true,
  },
  {
    title: t('pages.setting.table.header.type'),
    align: 'center',
    colKey: 'type'
  },
  {
    title: t('pages.setting.table.header.status'),
    align: 'center',
    colKey: 'isActive',
  },
  {
    title: t('pages.setting.table.header.operate'),
    align: 'center',
    fixed: 'right',
    width: 200,
    colKey: 'op',
  },
];
