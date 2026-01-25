import { APP_DATABASE_PATH } from '@main/utils/path';
import { generateUserAgent } from '@main/utils/systeminfo';
import { PROXY_TYPE } from '@shared/config/setting';
import type { ITheme } from '@shared/config/theme';
import type { ILang } from '@shared/locales';
import type { ProxyConfig } from 'electron';
import Store from 'electron-store';

export enum IStore {
  THEME = 'theme',
  ZOOM = 'zoom',
  LANG = 'lang',
  DNS = 'dns',
  HARDWARE_ACCELERATION = 'hardwareAcceleration',
  TIMEOUT = 'timeout',
  UA = 'ua',
  DEBUG = 'debug',
  PROXY = 'proxy',
}

export type IStoreKey = `${IStore}`;

export const STORE_KEYS: IStoreKey[] = Object.values(IStore);

export class ConfigManager {
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'config',
      cwd: APP_DATABASE_PATH,
    });
  }

  public get theme(): ITheme {
    return this.get(IStore.THEME, 'system');
  }

  public get lang(): ILang {
    return this.get(IStore.LANG, 'system');
  }

  public get zoom(): number {
    return this.get(IStore.ZOOM, 1);
  }

  public get dns(): string {
    return this.get(IStore.DNS);
  }

  public get hardwareAcceleration(): boolean {
    return this.get(IStore.HARDWARE_ACCELERATION, true);
  }

  public get timeout(): number {
    return this.get(IStore.TIMEOUT, 10 * 1000);
  }

  public get ua(): string {
    return this.get(IStore.UA, generateUserAgent());
  }

  public get debug(): boolean {
    return this.get(IStore.DEBUG, false);
  }

  public get proxy(): ProxyConfig {
    const { type, url: proxy, bypass } = this.get(IStore.PROXY, { type: 'system', url: '', bypass: '' });
    let proxyConfig: ProxyConfig;

    if (type === PROXY_TYPE.SYSTEM) {
      proxyConfig = { mode: 'system' };
    } else if (proxy) {
      proxyConfig = { mode: 'fixed_servers', proxyRules: proxy, proxyBypassRules: bypass };
    } else {
      proxyConfig = { mode: 'direct' };
    }

    return proxyConfig;
  }

  public set(key: string, value: unknown) {
    this.store.set(key, value);
  }

  public get<T>(key: string, defaultValue?: T) {
    return this.store.get(key, defaultValue) as T;
  }
}

export const configManager = new ConfigManager();
