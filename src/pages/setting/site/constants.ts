import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '资源名',
    align: 'left',
    width: 150,
    colKey: 'name',
    fixed: 'left',
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  { title: '启用', colKey: 'isActive', width: 80 },
  { title: '搜索', colKey: 'search', width: 80 },
  {
    title: '分组',
    width: 80,
    ellipsis: true,
    colKey: 'group',
    sorter: (a, b) => a.group.localeCompare(b.group, 'zh-Hans-CN'),
  },
  {
    title: '状态',
    width: 80,
    ellipsis: true,
    colKey: 'status',
    sorter: (a, b) => a.status - b.status,
  },
  {
    align: 'center',
    fixed: 'right',
    width: 240,
    colKey: 'op',
    title: '操作',
  },
];
