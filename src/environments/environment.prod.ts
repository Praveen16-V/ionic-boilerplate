export const environment = {
  production: true,
  apiUrl: 'https://api.yourapp.com/api',
  appName: 'Ionic Boilerplate',
  appVersion: '1.0.0',
  environment: 'production',
  
  // Authentication
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenRefreshThreshold: 300
  },

  // Monitoring
  sentry: {
    dsn: 'YOUR_SENTRY_DSN_HERE',
    environment: 'production',
    tracesSampleRate: 0.1
  },

  // Analytics
  analytics: {
    googleAnalyticsId: 'YOUR_GA_ID_HERE',
    enabled: true
  },

  // Feature Flags
  features: {
    debugMode: false,
    performanceMonitoring: true,
    offlineMode: true
  },

  // Cache
  cache: {
    ttl: 7200,
    enableServiceWorker: true
  },

  // Security
  security: {
    cspEnabled: true,
    corsOrigins: ['https://yourapp.com', 'https://www.yourapp.com']
  },

  // Push Notifications
  pushNotifications: {
    enabled: true,
    fcmServerKey: 'YOUR_FCM_SERVER_KEY_HERE'
  },

  // Social Login
  social: {
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    facebookAppId: 'YOUR_FACEBOOK_APP_ID_HERE',
    appleClientId: 'YOUR_APPLE_CLIENT_ID_HERE'
  },

  // Map Services
  maps: {
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
  },

  // Storage
  storage: {
    encryptionEnabled: true,
    prefix: 'ionic_boilerplate_'
  },

  // Logging
  logging: {
    level: 'error',
    logToConsole: false
  }
};
