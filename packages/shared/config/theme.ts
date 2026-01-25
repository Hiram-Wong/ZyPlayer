export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export type ITheme = `${THEME}`;
export type IThemeWithoutSystem = Exclude<ITheme, 'system'>;
