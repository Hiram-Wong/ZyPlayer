let store = {};
const putVar = (key: string, value: string | number) => {
  if (typeof value === 'string' || typeof value === 'number') store[key] = value;
};
const putMyVar = putVar;
const getVar = (key: string, value: string | number) => {
  if (typeof value === 'string' || typeof value === 'number') return store[key] || value;
  return value;
};
const getMyVar = getVar;
const clearVar = () => (store = {});
const clearMyVar = clearVar;
const listVarKeys = () => Object.keys(store);
const listMyVarKeys = listVarKeys;
const storage0 = {
  putMyVar: (key: string, value: any) => (store[key] = value),
  getMyVar: (key: string, value: any) => store[key] || value,
  clearMyVar: (key: string) => (store[key] = {}),
  listMyKeys: () => Object.keys(store),
  putVar: (key: string, value: any) => (store[key] = value),
  getVar: (key: string, value: any) => store[key] || value,
  clearVar: (key: string) => (store[key] = {}),
  listVarKeys: () => Object.keys(store),
  setItem: (key: string, value: any) => (store[key] = value),
  getItem: (key: string, value: any) => store[key] || value,
  clearItem: (key: string) => (store[key] = {}),
  listItemKeys: () => Object.keys(store),
};

export { putVar, putMyVar, getVar, getMyVar, clearVar, clearMyVar, listVarKeys, listMyVarKeys, storage0 };
