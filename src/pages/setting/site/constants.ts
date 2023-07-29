import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '名称',
    align: 'center',
    width: 100,
    colKey: 'name',
    fixed: 'left',
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  {
    title: '资源数',
    align: 'center',
    width: 100,
    colKey: 'resource',
  },
  { title: '搜索', align: 'center', colKey: 'search', width: 80 },
  {
    title: '分组',
    align: 'center',
    width: 80,
    ellipsis: true,
    colKey: 'group',
    sorter: (a, b) => a.group.localeCompare(b.group, 'zh-Hans-CN'),
  },
  {
    title: '状态',
    align: 'center',
    width: 80,
    ellipsis: true,
    colKey: 'status',
    sorter: (a, b) => a.status - b.status,
  },
  { title: '启用', align: 'center', colKey: 'isActive', width: 80 },
  {
    align: 'center',
    fixed: 'right',
    width: 240,
    colKey: 'op',
    title: '操作',
  },
];
