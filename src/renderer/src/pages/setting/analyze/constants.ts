import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '名称',
    align: 'left',
    width: 150,
    colKey: 'name',
    fixed: 'left',
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  // { title: '类型', colKey: 'type', width: 100 },
  { title: '启用',
    colKey: 'isActive',
    width: 100,
    align: 'left',
    ellipsis: true,
  },
  {
    align: 'center',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: '操作',
  },
];
