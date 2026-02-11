export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Ionic Boilerplate',
  appVersion: '1.0.0',
  environment: 'development',
  
  // Authentication
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenRefreshThreshold: 300
  },

  // Monitoring
  sentry: {
    dsn: '',
    environment: 'development',
    tracesSampleRate: 1.0
  },

  // Analytics
  analytics: {
    googleAnalyticsId: '',
    enabled: false
  },

  // Feature Flags
  features: {
    debugMode: true,
    performanceMonitoring: true,
    offlineMode: false
  },

  // Cache
  cache: {
    ttl: 3600,
    enableServiceWorker: true
  },

  // Security
  security: {
    cspEnabled: true,
    corsOrigins: ['http://localhost:4200', 'http://localhost:8100']
  },

  // Push Notifications
  pushNotifications: {
    enabled: false,
    fcmServerKey: ''
  },

  // Social Login
  social: {
    googleClientId: '',
    facebookAppId: '',
    appleClientId: ''
  },

  // Map Services
  maps: {
    googleMapsApiKey: ''
  },

  // Storage
  storage: {
    encryptionEnabled: false,
    prefix: 'ionic_boilerplate_'
  },

  // Logging
  logging: {
    level: 'debug',
    logToConsole: true
  }
};
