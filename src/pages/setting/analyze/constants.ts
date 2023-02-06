import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '资源名',
    align: 'left',
    width: 150,
    colKey: 'name',
    fixed: 'left',
    sorter: true,
  },
  { title: '启用', colKey: 'isActive', width: 100 },
  {
    align: 'center',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: '操作',
  },
];
