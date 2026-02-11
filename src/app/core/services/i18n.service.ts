import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly LANGUAGE_KEY = 'selected_language';
  private readonly DEFAULT_LANGUAGE = 'en';
  private readonly SUPPORTED_LANGUAGES = ['en', 'ta', 'hi'];

  constructor(
    private translate: TranslateService,
    private platform: Platform
  ) {
    this.initializeTranslation();
  }

  private async initializeTranslation(): Promise<void> {
    // Set fallback language instead of deprecated default language
    this.translate.setFallbackLang(this.DEFAULT_LANGUAGE);

    // Register supported languages
    this.translate.addLangs(this.SUPPORTED_LANGUAGES);

    // Get saved language or detect browser language
    const savedLanguage = await this.getSavedLanguage();
    const browserLanguage = this.translate.getBrowserLang();
    
    // Use saved language, browser language, or default
    const language = savedLanguage || 
      (browserLanguage && this.SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : this.DEFAULT_LANGUAGE);
    
    this.setLanguage(language);
  }

  async setLanguage(language: string): Promise<void> {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      console.warn(`Language '${language}' is not supported. Using default language.`);
      language = this.DEFAULT_LANGUAGE;
    }

    try {
      await this.translate.use(language).toPromise();
      await Preferences.set({
        key: this.LANGUAGE_KEY,
        value: language
      });
      
      // Update document direction for RTL languages if needed
      this.updateDocumentDirection(language);
      
      if (environment.features.debugMode) {
        console.log(`Language set to: ${language}`);
      }
    } catch (error) {
      console.error('Error setting language:', error);
      // Fallback to default language
      await this.translate.use(this.DEFAULT_LANGUAGE).toPromise();
    }
  }

  async getSavedLanguage(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.LANGUAGE_KEY });
      return value;
    } catch (error) {
      console.error('Error getting saved language:', error);
      return null;
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANGUAGE;
  }

  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string; flag: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: 'US' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'TN' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' }
    ];
  }

  instant(key: string | string[], interpolateParams?: Object): string {
    return this.translate.instant(key, interpolateParams);
  }

  async translateAsync(key: string | string[], interpolateParams?: Object): Promise<string> {
    return await this.translate.get(key, interpolateParams).toPromise();
  }

  private updateDocumentDirection(language: string): void {
    // Add RTL languages here if needed
    const rtlLanguages = ['ar', 'he', 'fa'];
    const direction = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    
    if (this.platform.is('capacitor')) {
      // For native platforms, you might need to handle this differently
      document.documentElement.dir = direction;
    } else {
      document.documentElement.dir = direction;
    }
  }

  async resetToDefault(): Promise<void> {
    await this.setLanguage(this.DEFAULT_LANGUAGE);
  }

  getLanguageDisplayName(languageCode: string): string {
    const language = this.getSupportedLanguages().find(lang => lang.code === languageCode);
    return language ? language.nativeName : languageCode;
  }

  // Method to check if a language is supported
  isLanguageSupported(language: string): boolean {
    return this.SUPPORTED_LANGUAGES.includes(language);
  }

  // Get browser language (useful for initial setup)
  getBrowserLanguage(): string | undefined {
    return this.translate.getBrowserLang();
  }

  // Method to format dates according to current locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const language = this.getCurrentLanguage();
    return new Intl.DateTimeFormat(language, options).format(date);
  }

  // Method to format numbers according to current locale
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const language = this.getCurrentLanguage();
    return new Intl.NumberFormat(language, options).format(number);
  }

  // Method to format currency according to current locale
  formatCurrency(amount: number, currency: string = 'USD'): string {
    const language = this.getCurrentLanguage();
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}
