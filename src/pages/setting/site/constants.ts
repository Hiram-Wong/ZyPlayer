import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '名称',
    fixed: 'left',
    width: 100,
    ellipsis: true,
    align: 'left',
    colKey: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  {
    title: '资源数',
    align: 'left',
    width: 100,
    colKey: 'resource',
  },
  { title: '搜索', align: 'left', colKey: 'search', width: 80 },
  {
    title: '分组',
    align: 'left',
    width: 100,
    ellipsis: true,
    colKey: 'group',
    sorter: (a, b) => a.group.localeCompare(b.group, 'zh-Hans-CN'),
  },
  { title: '启用', align: 'left', colKey: 'isActive', width: 80 },
  {
    align: 'center',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: '操作',
  },
];
