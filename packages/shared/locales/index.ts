const langModules = import.meta.glob('./lang/*/index.ts', { eager: true });

const langModuleMap = new Map<string, object>();

export const langCode: Array<ILangWithoutSystem> = [];

export type ILangCode = (typeof langCode)[number];

export type ISupportLang = 'zh-CN' | 'zh-TW' | 'el-GR' | 'en-US' | 'es-ES' | 'fr-FR' | 'ja-JP' | 'pt-PT' | 'ru-RU';
export type ILang = ISupportLang | 'system';
export type ILangWithoutSystem = Exclude<ILang, 'system'>;

const generateLangModuleMap = () => {
  const fullPaths = Object.keys(langModules);
  fullPaths.forEach((fullPath) => {
    const k = fullPath.replace('./lang', '');
    const startIndex = 1;
    const lastIndex = k.lastIndexOf('/');
    const code = k.substring(startIndex, lastIndex);
    langCode.push(code as ILangWithoutSystem);
    langModuleMap.set(code, langModules[fullPath] as object);
  });
};

export const messages = () => {
  generateLangModuleMap();

  const message = {};
  langModuleMap.forEach((value: any, key) => {
    message[key] = value.default;
  });
  return message;
};

export const lang = () => {
  if (langModuleMap.size === 0) generateLangModuleMap();

  const list: Array<{ value: ILangWithoutSystem; label: string }> = [];
  langModuleMap.forEach((value: any, key) => {
    list.push({ label: value.default.lang, value: key as ILangWithoutSystem });
  });

  return list;
};

export const fallbackLocale = 'en-US';
export const defaultLocale = 'zh-CN';
