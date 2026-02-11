import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';
import { environment } from '../../../environments/environment';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SentryService {
  private isInitialized = false;

  constructor(private platform: Platform) {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    const config = this.getSentryConfig();
    
    if (!config.enabled || !config.dsn) {
      console.log('Sentry is disabled or DSN not configured');
      return;
    }

    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        tracesSampleRate: config.tracesSampleRate,
        integrations: [
          new BrowserTracing({
            routingInstrumentation: Sentry.routingInstrumentation,
          }),
        ],
        beforeSend: (event, hint) => {
          // Filter out certain errors or add additional context
          return this.beforeSend(event, hint);
        },
        ignoreErrors: [
          // Common browser errors that don't need to be tracked
          'Non-Error promise rejection captured',
          'ResizeObserver loop limit exceeded',
          'Network request failed',
          'ChunkLoadError',
          'Loading chunk',
        ],
        denyUrls: [
          // Ignore errors from browser extensions
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /^moz-extension:\/\//i,
        ],
      });

      this.isInitialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  private getSentryConfig(): SentryConfig {
    return {
      dsn: environment.sentry.dsn,
      environment: environment.sentry.environment,
      tracesSampleRate: environment.sentry.tracesSampleRate,
      enabled: !!environment.sentry.dsn && environment.environment !== 'development'
    };
  }

  private beforeSend(event: Sentry.Event, hint?: Sentry.EventHint): Sentry.Event | null {
    // Add custom context based on platform
    if (Capacitor.isNativePlatform()) {
      event.tags = {
        ...event.tags,
        platform: Capacitor.getPlatform(),
        isNative: 'true'
      };
    } else {
      event.tags = {
        ...event.tags,
        platform: 'web',
        isNative: 'false'
      };
    }

    // Add device information for native platforms
    if (Capacitor.isNativePlatform()) {
      event.contexts = {
        ...event.contexts,
        device: {
          name: Capacitor.getPlatform(),
          type: 'mobile'
        }
      };
    }

    // Filter out sensitive information
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
        // Filter out breadcrumbs with sensitive URLs
        if (breadcrumb.category === 'xhr' && breadcrumb.data?.url) {
          return !breadcrumb.data.url.includes('token') && 
                 !breadcrumb.data.url.includes('password') &&
                 !breadcrumb.data.url.includes('secret');
        }
        return true;
      });
    }

    // Add user information if available
    const user = this.getCurrentUser();
    if (user) {
      event.user = { ...event.user, ...user };
    }

    return event;
  }

  private getCurrentUser(): any {
    // This would typically get user info from your auth service
    // For now, return null to avoid collecting user data
    return null;
  }

  // Public API methods

  captureException(error: Error, context?: { [key: string]: any }): void {
    if (!this.isInitialized) return;

    try {
      if (context) {
        Sentry.withScope((scope) => {
          Object.keys(context).forEach(key => {
            scope.setExtra(key, context[key]);
          });
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
    } catch (e) {
      console.error('Failed to capture exception in Sentry:', e);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: { [key: string]: any }): void {
    if (!this.isInitialized) return;

    try {
      if (context) {
        Sentry.withScope((scope) => {
          Object.keys(context).forEach(key => {
            scope.setExtra(key, context[key]);
          });
          Sentry.captureMessage(message, level);
        });
      } else {
        Sentry.captureMessage(message, level);
      }
    } catch (e) {
      console.error('Failed to capture message in Sentry:', e);
    }
  }

  setUser(user: Sentry.User | null): void {
    if (!this.isInitialized) return;

    try {
      Sentry.setUser(user);
    } catch (e) {
      console.error('Failed to set user in Sentry:', e);
    }
  }

  setTag(key: string, value: string): void {
    if (!this.isInitialized) return;

    try {
      Sentry.setTag(key, value);
    } catch (e) {
      console.error('Failed to set tag in Sentry:', e);
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized) return;

    try {
      Sentry.setExtra(key, value);
    } catch (e) {
      console.error('Failed to set extra in Sentry:', e);
    }
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.isInitialized) return;

    try {
      Sentry.addBreadcrumb(breadcrumb);
    } catch (e) {
      console.error('Failed to add breadcrumb in Sentry:', e);
    }
  }

  // Performance monitoring
  startTransaction(name: string, op: string = 'navigation'): Sentry.Transaction | undefined {
    if (!this.isInitialized) return undefined;

    try {
      return Sentry.startTransaction({
        name,
        op
      });
    } catch (e) {
      console.error('Failed to start transaction in Sentry:', e);
      return undefined;
    }
  }

  // Convenience methods for common operations
  logError(error: Error, context?: string): void {
    const extra = context ? { context } : undefined;
    this.captureException(error, extra);
  }

  logUserAction(action: string, details?: any): void {
    this.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user',
      level: 'info',
      data: details
    });
  }

  logApiCall(url: string, method: string, statusCode?: number, duration?: number): void {
    this.addBreadcrumb({
      message: `API ${method} ${url}`,
      category: 'http',
      level: statusCode && statusCode >= 400 ? 'error' : 'info',
      data: {
        url,
        method,
        statusCode,
        duration
      }
    });
  }

  logNavigation(from: string, to: string): void {
    this.addBreadcrumb({
      message: `Navigation from ${from} to ${to}`,
      category: 'navigation',
      level: 'info',
      data: { from, to }
    });
  }

  // Feature flag for enabling/disabling Sentry
  isEnabled(): boolean {
    return this.isInitialized;
  }

  // Get current configuration
  getConfig(): SentryConfig {
    return this.getSentryConfig();
  }

  // Manual crash for testing (only in development)
  testCrash(): void {
    if (environment.environment === 'development') {
      throw new Error('Test crash - This is a test exception for Sentry');
    } else {
      console.warn('Test crash is only available in development environment');
    }
  }
}
