/**
 * Environment configuration helper
 * Centralizes all environment variable access
 */

export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000,

  // Upload Configuration
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sweet Shop',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',

  // External Services
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',

  // Theme Configuration
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'dark',
  ENABLE_THEME_SWITCHER: import.meta.env.VITE_ENABLE_THEME_SWITCHER === 'true',

  // Helper methods
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getMode: () => import.meta.env.MODE,
};

// Validation helper
export const validateEnv = () => {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

// Debug helper (only in development)
if (env.isDevelopment() && env.ENABLE_DEBUG) {
  console.log('Environment Configuration:', {
    API_BASE_URL: env.API_BASE_URL,
    ENVIRONMENT: env.ENVIRONMENT,
    APP_VERSION: env.APP_VERSION,
    ENABLE_DEBUG: env.ENABLE_DEBUG,
  });
}