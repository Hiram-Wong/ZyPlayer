import { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';

export const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '名称',
    colKey: 'name',
    width: 200,
    align: 'left',
    fixed: 'left',
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  {
    title: '类型',
    colKey: 'type',
    width: 100,
    align: 'left',
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
  },
  { title: '启用',
    colKey: 'isActive', 
    align: 'left',
    ellipsis: true,
    width: 100
  },
  {
    title: '操作',
    colKey: 'op',
    align: 'center',
    fixed: 'right',
    width: 200,
  },
];
