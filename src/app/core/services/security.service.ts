import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

export interface SecurityConfig {
  cspEnabled: boolean;
  corsOrigins: string[];
  encryptionEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly SESSION_KEY = 'session_data';
  private readonly LOGIN_ATTEMPTS_KEY = 'login_attempts';
  private readonly ENCRYPTION_KEY = 'encryption_key';

  constructor(private platform: Platform) {}

  getSecurityConfig(): SecurityConfig {
    return {
      cspEnabled: environment.security.cspEnabled,
      corsOrigins: environment.security.corsOrigins,
      encryptionEnabled: environment.storage.encryptionEnabled,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    };
  }

  // Content Security Policy
  getCSPHeader(): string {
    const config = this.getSecurityConfig();
    if (!config.cspEnabled) return '';

    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self'",
      `connect-src 'self' ${environment.apiUrl} https://www.google-analytics.com`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  // CORS Configuration
  validateOrigin(origin: string): boolean {
    const config = this.getSecurityConfig();
    return config.corsOrigins.includes(origin) || origin.startsWith('http://localhost');
  }

  // Session Management
  async createSession(userData: any): Promise<void> {
    const sessionData = {
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.getSecurityConfig().sessionTimeout
    };

    if (this.platform.is('capacitor')) {
      // For native platforms, use Capacitor Preferences
      await Preferences.set({
        key: this.SESSION_KEY,
        value: JSON.stringify(sessionData)
      });
    } else {
      // For web, use localStorage
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }
  }

  async getSession(): Promise<any | null> {
    try {
      let sessionData: string | null = null;

      if (this.platform.is('capacitor')) {
        const { value } = await Preferences.get({ key: this.SESSION_KEY });
        sessionData = value;
      } else {
        sessionData = localStorage.getItem(this.SESSION_KEY);
      }

      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        await this.clearSession();
        return null;
      }

      // Update last activity
      session.lastActivity = Date.now();
      await this.updateSession(session);
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async updateSession(sessionData: any): Promise<void> {
    if (this.platform.is('capacitor')) {
      await Preferences.set({
        key: this.SESSION_KEY,
        value: JSON.stringify(sessionData)
      });
    } else {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }
  }

  async clearSession(): Promise<void> {
    if (this.platform.is('capacitor')) {
      await Preferences.remove({ key: this.SESSION_KEY });
    } else {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  // Login Attempts Tracking
  async incrementLoginAttempts(): Promise<number> {
    const key = this.LOGIN_ATTEMPTS_KEY;
    let attempts = 0;

    try {
      if (this.platform.is('capacitor')) {
        const { value } = await Preferences.get({ key });
        attempts = value ? parseInt(value, 10) : 0;
        attempts++;
        await Preferences.set({ key, value: attempts.toString() });
      } else {
        attempts = parseInt(localStorage.getItem(key) || '0', 10);
        attempts++;
        localStorage.setItem(key, attempts.toString());
      }
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
    }

    return attempts;
  }

  async resetLoginAttempts(): Promise<void> {
    const key = this.LOGIN_ATTEMPTS_KEY;
    
    if (this.platform.is('capacitor')) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async isAccountLocked(): Promise<boolean> {
    const config = this.getSecurityConfig();
    const attempts = await this.getLoginAttempts();
    return attempts >= config.maxLoginAttempts;
  }

  private async getLoginAttempts(): Promise<number> {
    const key = this.LOGIN_ATTEMPTS_KEY;
    
    if (this.platform.is('capacitor')) {
      const { value } = await Preferences.get({ key });
      return value ? parseInt(value, 10) : 0;
    } else {
      return parseInt(localStorage.getItem(key) || '0', 10);
    }
  }

  // Password Validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const policy = this.getSecurityConfig().passwordPolicy;
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  // XSS Protection
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Rate Limiting
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (record.count >= maxRequests) {
      return true;
    }

    record.count++;
    return false;
  }

  // Security Headers for API calls
  getSecurityHeaders(): { [key: string]: string } {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Device Security Check
  async isDeviceSecure(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web platforms assumed secure for this context
    }

    try {
      // Check for jailbreak/root detection
      if (Capacitor.getPlatform() === 'ios') {
        // iOS jailbreak detection
        const suspiciousPaths = [
          '/Applications/Cydia.app',
          '/Library/MobileSubstrate/MobileSubstrate.dylib',
          '/bin/bash',
          '/usr/sbin/sshd',
          '/etc/apt'
        ];
        
        // In a real implementation, you would use a native plugin to check these paths
        return true; // Placeholder
      } else if (Capacitor.getPlatform() === 'android') {
        // Android root detection
        // In a real implementation, you would use a native plugin to check for root
        return true; // Placeholder
      }

      return true;
    } catch (error) {
      console.error('Error checking device security:', error);
      return false;
    }
  }
}
