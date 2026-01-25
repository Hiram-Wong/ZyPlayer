export const ZOOM_LEVELS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

// 从 ZOOM_LEVELS 生成 Ant Design Select 所需的 options 结构
export const ZOOM_OPTIONS = ZOOM_LEVELS.map((level) => ({
  value: level,
  label: `${Math.round(level * 100)}%`,
}));

export const ZOOM_SHORTCUTS = [
  {
    key: 'zoom_in',
    shortcut: ['CommandOrControl', '='],
    editable: false,
    enabled: true,
    system: true,
  },
  {
    key: 'zoom_out',
    shortcut: ['CommandOrControl', '-'],
    editable: false,
    enabled: true,
    system: true,
  },
  {
    key: 'zoom_reset',
    shortcut: ['CommandOrControl', '0'],
    editable: false,
    enabled: true,
    system: true,
  },
];

export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;

export enum UpgradeChannel {
  LATEST = 'latest',
  RC = 'rc',
  BETA = 'beta',
}

export const defaultTimeout = 10 * 1000 * 60;

export const occupiedDirs = ['logs', 'Network', 'Partitions/webview/Network'];

export const defaultByPassRules = 'localhost,127.0.0.1,::1';
