// 转换大小写
export const toKebabCase = (string: string): string => {
  return string.replace(/\B([A-Z])/g, '-$1').toLowerCase();
};

// 连字符转驼峰
export const toPascalCase = (string: string): string => {
  return string
    .replace(/^./, (match) => match.toUpperCase())
    .replace(/-(\w)/g, (_, p1: string) => {
      return p1?.toUpperCase() ?? '';
    });
};

// 驼峰转连字符
export const toCamelCase = (string: string): string => {
  return string
    .replace(/^./, (match) => match.toLowerCase())
    .replace(/-(\w)/g, (_, p1: string) => {
      return p1?.toUpperCase() ?? '';
    });
};
