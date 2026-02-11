import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeMode, ThemeConfig } from '../interfaces/theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'app_theme';
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('light');
  
  public currentTheme$: Observable<ThemeMode> = this.currentThemeSubject.asObservable();

  constructor() {
    this.loadStoredTheme();
  }

  private loadStoredTheme(): void {
    const storedTheme = localStorage.getItem(this.themeKey) as ThemeMode;
    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      this.currentThemeSubject.next(storedTheme);
      this.applyTheme(storedTheme);
    } else {
      // Default to light theme
      this.setTheme('light');
    }
  }

  setTheme(theme: ThemeMode): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(this.themeKey, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const body = document.body;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.toggle('dark', prefersDark);
    } else {
      body.classList.toggle('dark', theme === 'dark');
    }
  }

  toggleTheme(): void {
    const currentTheme = this.currentThemeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.value;
  }

  isDarkMode(): boolean {
    const theme = this.currentThemeSubject.value;
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }
}
