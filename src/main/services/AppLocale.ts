import { loggerService } from '@logger';
import { configManager } from '@main/services/ConfigManager';
import { LOG_MODULE } from '@shared/config/logger';
import type { ILang, ILangWithoutSystem } from '@shared/locales';
import { defaultLocale, fallbackLocale, langCode, messages } from '@shared/locales';
import { app } from 'electron';
import type { InitOptions } from 'i18next';
import i18n, { changeLanguage, init as createI18n } from 'i18next';

const logger = loggerService.withContext(LOG_MODULE.APP_LOCALE);

export class AppLocale {
  private static instance: AppLocale;

  constructor() {}

  public static getInstance(): AppLocale {
    if (!AppLocale.instance) {
      AppLocale.instance = new AppLocale();
    }
    return AppLocale.instance;
  }

  public init(): void {
    const resources = Object.fromEntries(
      Object.entries(messages()).map(([k, v]) => [k, { translation: v }]),
    ) as InitOptions['resources'];

    createI18n({
      resources,
      lng: this.defaultLang(),
      fallbackLng: fallbackLocale,
      interpolation: {
        escapeValue: false,
      },
      saveMissing: true,
      missingKeyHandler: (_lngs: readonly string[], _ns: string, key: string) => {
        logger.warn(`Missing key: ${key}`);
      },
    });
  }

  public changeLocale(value: ILang): void {
    const lang = this.defaultLang(value);

    if (i18n.language === lang) return;

    changeLanguage(lang, (error) => {
      if (error) {
        return logger.error(`Failed to change language: ${error.message}`);
      }
      logger.info(`Language changed to ${lang}`);
    });
  }

  public defaultLang(value?: ILang): ILangWithoutSystem {
    let lang = value;

    if (!lang) {
      lang = configManager.lang;
    }
    if (!lang || lang === 'system') {
      const appLocale = app.getLocale();
      if (appLocale.startsWith('zh')) {
        const region = appLocale.split('-')[1];

        // On Windows and macOS, Chinese languages returned by
        // app.getPreferredSystemLanguages() start with zh-hans
        // for Simplified Chinese or zh-hant for Traditional Chinese,
        // so we can easily determine whether to use Simplified or Traditional.
        // However, on Linux, Chinese languages returned by that same API
        // are of the form zh-XY, where XY is a country code.
        // For China (CN), Singapore (SG), and Malaysia (MY)
        // country codes, assume they use Simplified Chinese.
        // For other cases, assume they use Traditional.
        if (['hans', 'cn', 'sg', 'my'].includes(region.toLocaleLowerCase())) {
          lang = 'zh-CN';
        }

        lang = 'zh-TW';
      }

      lang = appLocale as ILangWithoutSystem;
    }

    if (!langCode.includes(lang)) {
      lang = defaultLocale;
    }

    return lang;
  }

  public isChinaMainland(): boolean {
    const lang = this.defaultLang();
    return lang === 'zh-CN';
  }
}

export const appLocale = AppLocale.getInstance();

export { t } from 'i18next';
