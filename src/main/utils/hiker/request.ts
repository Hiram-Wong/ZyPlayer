import * as syncFetch from './syncFetch';
import * as syncRequest from './syncRequest';

// 单独导出 `syncFetch` 和 `syncRequest`
const module = { syncFetch, syncRequest };
export { module };

// 导出 `syncFetch` 中的所有内容
export * from './syncFetch';
