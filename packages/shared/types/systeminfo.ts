export type IPlatform = 'win32' | 'darwin' | 'linux' | 'ohos' | 'unknown';
export type IArch = 'x86_64' | 'x86_32' | 'arm_64' | 'arm_32' | 'mips' | 'loong_64' | 'riscv_64' | 'unknown';

export interface ISystemInfo {
  platform: IPlatform;
  arch: IArch;
  release: string;
  osString: string;
}
