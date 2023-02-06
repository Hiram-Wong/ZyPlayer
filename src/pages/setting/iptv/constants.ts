import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '资源名',
    colKey: 'name',
    width: 300,
    align: 'left',
    fixed: 'left',
    sorter: true,
  },
  { title: '启用', colKey: 'isActive', width: 100 },
  {
    title: '操作',
    colKey: 'op',
    align: 'center',
    fixed: 'right',
    width: 200,
  },
];
