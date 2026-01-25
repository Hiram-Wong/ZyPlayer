import { useSettingStore } from '@/store';

const iconModules = import.meta.glob('../assets/img/icon/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const icons: Record<string, string> = (() => {
  const iconList: Record<string, string> = {};

  for (const path in iconModules) {
    const iconFileName = path.split('/').pop();
    if (!iconFileName) continue;

    // 分离文件名和后缀
    const [iconName, _iconSuffix] = iconFileName.split('.');
    const svgContent = iconModules[path] as string;

    iconList[iconName] = svgContent;
  }

  return iconList;
})();

const color = {
  theme: '#00c452',
  process: 'linear-gradient(270deg,#00e038,#32ccff)',
};

const language = () => {
  const settingStore = useSettingStore();
  const DEFAULT_LANGUAGE = 'en_US';

  const getStoredLanguage = settingStore.displayLang;

  const lang = getStoredLanguage || DEFAULT_LANGUAGE;
  return lang;
};

export { color, icons, language };
