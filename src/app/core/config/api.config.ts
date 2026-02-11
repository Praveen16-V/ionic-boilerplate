import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout'
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update'
    }
  },
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
