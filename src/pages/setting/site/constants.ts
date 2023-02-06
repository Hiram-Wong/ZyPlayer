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
    title: '分组',
    width: 100,
    ellipsis: true,
    colKey: 'group',
    sorter: true,
  },
  {
    title: '状态',
    width: 100,
    ellipsis: true,
    colKey: 'status',
    sorter: true,
  },
  {
    align: 'center',
    fixed: 'right',
    width: 240,
    colKey: 'op',
    title: '操作',
  },
];
