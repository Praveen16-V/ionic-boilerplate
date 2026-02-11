export const AUTH_CONFIG = {
  // Endpoints that should NOT include access token
  // These endpoints typically handle authentication themselves
  EXCLUDED_ENDPOINTS: [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email'
  ],

  // HTTP methods that should be excluded from token injection
  EXCLUDED_METHODS: [],

  // Check if a URL should be excluded from token injection
  shouldExcludeToken(url: string, method?: string): boolean {
    // Check if URL contains any excluded endpoint
    const isExcludedEndpoint = this.EXCLUDED_ENDPOINTS.some(endpoint => 
      url.includes(endpoint)
    );

    // Check if HTTP method is excluded (if provided)
    const isExcludedMethod = method && this.EXCLUDED_METHODS.includes(method);

    return isExcludedEndpoint || isExcludedMethod;
  }
};
