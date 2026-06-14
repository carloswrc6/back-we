import { Injectable } from '@nestjs/common';
import { translations, Language, TranslationKey } from '../i18n/index';

@Injectable()
export class I18nService {
  private defaultLanguage: Language = 'en';

  /**
   * Get a translation by key and language
   * @param key Translation key in dot notation (e.g., 'auth.login_success')
   * @param language Language code ('es' or 'en')
   * @returns Translated string or key if not found
   */
  t(key: TranslationKey, language: Language = this.defaultLanguage): string {
    try {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return key; // Return key if translation not found
        }
      }

      return value;
    } catch (error) {
      return key;
    }
  }

  /**
   * Get all translations for a specific language
   * @param language Language code ('es' or 'en')
   * @returns Translation object
   */
  getLanguageTranslations(language: Language) {
    return translations[language] || translations[this.defaultLanguage];
  }

  /**
   * Set default language
   * @param language Language code to set as default
   */
  setDefaultLanguage(language: Language) {
    if (translations[language]) {
      this.defaultLanguage = language;
    }
  }

  /**
   * Get available languages
   * @returns Array of available language codes
   */
  getAvailableLanguages(): Language[] {
    return Object.keys(translations) as Language[];
  }

  /**
   * Check if language is supported
   * @param language Language code to check
   * @returns True if language is supported
   */
  isLanguageSupported(language: string): language is Language {
    return language in translations;
  }
}
