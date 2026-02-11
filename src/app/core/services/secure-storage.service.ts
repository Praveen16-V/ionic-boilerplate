import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';
  private readonly refreshTokenKey = 'refresh_token';

  async setToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.tokenKey,
      value: token
    });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.tokenKey });
    return value;
  }

  async setUser(user: any): Promise<void> {
    await Preferences.set({
      key: this.userKey,
      value: JSON.stringify(user)
    });
  }

  async getUser(): Promise<any | null> {
    const { value } = await Preferences.get({ key: this.userKey });
    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        await this.clearUser();
      }
    }
    return null;
  }

  async setRefreshToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.refreshTokenKey,
      value: token
    });
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.refreshTokenKey });
    return value;
  }

  async clearToken(): Promise<void> {
    await Preferences.remove({ key: this.tokenKey });
  }

  async clearUser(): Promise<void> {
    await Preferences.remove({ key: this.userKey });
  }

  async clearRefreshToken(): Promise<void> {
    await Preferences.remove({ key: this.refreshTokenKey });
  }

  async clearAll(): Promise<void> {
    await Preferences.remove({ key: this.tokenKey });
    await Preferences.remove({ key: this.userKey });
    await Preferences.remove({ key: this.refreshTokenKey });
  }

  // Fallback to localStorage for web development
  private isNative(): boolean {
    return !!(window as any).Capacitor;
  }

  async getTokenWeb(): Promise<string | null> {
    if (this.isNative()) {
      return this.getToken();
    } else {
      return Promise.resolve(localStorage.getItem(this.tokenKey));
    }
  }

  async setUserWeb(user: any): Promise<void> {
    if (this.isNative()) {
      return this.setUser(user);
    } else {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      return Promise.resolve();
    }
  }

  async getUserWeb(): Promise<any | null> {
    if (this.isNative()) {
      return this.getUser();
    } else {
      const userStr = localStorage.getItem(this.userKey);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          this.clearUserWeb();
        }
      }
      return Promise.resolve(null);
    }
  }

  async clearTokenWeb(): Promise<void> {
    if (this.isNative()) {
      return this.clearToken();
    } else {
      localStorage.removeItem(this.tokenKey);
      return Promise.resolve();
    }
  }

  async clearUserWeb(): Promise<void> {
    if (this.isNative()) {
      return this.clearUser();
    } else {
      localStorage.removeItem(this.userKey);
      return Promise.resolve();
    }
  }

  async clearAllWeb(): Promise<void> {
    if (this.isNative()) {
      return this.clearAll();
    } else {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.refreshTokenKey);
      return Promise.resolve();
    }
  }
}
