export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}
