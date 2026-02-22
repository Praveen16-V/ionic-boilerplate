import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  SupportedLanguage,
  Translation,
  LanguageConfig,
} from "../interfaces/language.interface";
import { ApplicationRef } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private languageKey = "app_language";
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>("en");
  private translations: { [key in SupportedLanguage]: Translation } = {} as any;
  private translationCache: { [key: string]: string } = {};
  private translationsLoaded = false;

  public currentLanguage$: Observable<SupportedLanguage> =
    this.currentLanguageSubject.asObservable();

  readonly supportedLanguages: LanguageConfig[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇱🇰" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  ];

  // Default English translations as fallback
  private defaultTranslations: Translation = {
    common: {
      welcome: "Welcome",
      home: "Home",
      about: "About",
      profile: "Profile",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      theme: "Theme",
      language: "Language",
    },
    home: {
      welcomeMessage: "Welcome to our application",
      description:
        "A modern cross-platform application built with Ionic and Angular",
    },
    about: {
      title: "About Us",
      description:
        "This is a modern cross-platform application built with Ionic Framework and Angular.",
      features: "Features",
      technologies: "Technologies",
    },
  };

  constructor(
    private http: HttpClient,
    private applicationRef: ApplicationRef,
  ) {
    this.loadStoredLanguage();
    this.loadTranslations();
  }

  private loadStoredLanguage(): void {
    const storedLanguage = localStorage.getItem(
      this.languageKey,
    ) as SupportedLanguage;
    if (
      storedLanguage &&
      this.supportedLanguages.some((lang) => lang.code === storedLanguage)
    ) {
      this.currentLanguageSubject.next(storedLanguage);
    }
  }

  private loadTranslations(): void {
    // Set default translations immediately
    this.translations["en"] = this.defaultTranslations;
    this.translationsLoaded = true;

    // Only load the current language, not all languages
    const currentLang = this.getCurrentLanguage();
    if (currentLang !== "en") {
      this.loadLanguage(currentLang);
    }
  }

  private loadLanguage(language: SupportedLanguage): void {
    this.http.get<Translation>(`assets/i18n/${language}.json`).subscribe({
      next: (translations) => {
        this.translations[language] = translations;
        // Clear cache to refresh translations for this language
        this.translationCache = {};
        // Trigger change detection to update UI
        this.applicationRef.tick();
      },
      error: (error) => {
        console.error(`Failed to load translations for ${language}:`, error);
        // Keep default translations if loading fails
      },
    });
  }

  setLanguage(language: SupportedLanguage): void {
    console.log("Language change requested to:", language);
    this.currentLanguageSubject.next(language);
    localStorage.setItem(this.languageKey, language);
    // Clear cache when language changes
    this.translationCache = {};

    // Load the new language if not already loaded and not English
    if (language !== "en" && !this.translations[language]) {
      this.loadLanguage(language);
    } else {
      // Trigger change detection to update UI immediately
      this.applicationRef.tick();
    }

    console.log("Language changed to:", this.getCurrentLanguage());
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const cacheKey = `${this.currentLanguageSubject.value}:${key}`;

    // Check cache first
    if (this.translationCache[cacheKey]) {
      return this.translationCache[cacheKey];
    }

    const keys = key.split(".");
    let translation: any = this.translations[this.currentLanguageSubject.value];

    // If no translation available for current language, try default English
    if (!translation && this.currentLanguageSubject.value !== "en") {
      translation = this.translations["en"];
    }

    // If still no translation, use default translations
    if (!translation) {
      translation = this.defaultTranslations;
    }

    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = translation[k];
      } else {
        // Cache the key as fallback
        this.translationCache[cacheKey] = key;
        return key;
      }
    }

    const result = typeof translation === "string" ? translation : key;
    // Cache the result
    this.translationCache[cacheKey] = result;
    return result;
  }

  instant(key: string): string {
    return this.translate(key);
  }
}
