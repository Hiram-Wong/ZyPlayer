export enum SHORTCUT_TYPE {
  GLOBAL = 'global',
  LOCAL = 'local',
}
export type IShortcutType = (typeof SHORTCUT_TYPE)[keyof typeof SHORTCUT_TYPE];

export interface IShortcutConfig {
  type: IShortcutType;
  winName?: string;
  shortcut: string;
  handler: () => Promise<void> | void | string;
  cb?: () => Promise<void> | void;
}
