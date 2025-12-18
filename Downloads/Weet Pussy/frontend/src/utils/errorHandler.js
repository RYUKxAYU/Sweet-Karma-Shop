/**
 * Error handling utilities for the Sweet Shop application
 */

export const getErrorMessage = (error) => {
  // Network errors
  if (error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The server might be busy, please try again.';
  }
  
  // CORS errors (common in development/deployment)
  if (error.message?.includes('CORS')) {
    return 'Server configuration issue. Please contact support if this persists.';
  }
  
  // HTTP status errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data?.detail || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested item may have been removed.';
      case 409:
        return data?.detail || 'Conflict. This item may already exist.';
      case 422:
        return data?.detail || 'Invalid data provided. Please check your input.';
      case 500:
        return 'Server error. Please try again later or contact support.';
      case 503:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      default:
        return data?.detail || `Server error (${status}). Please try again.`;
    }
  }
  
  // Generic error fallback
  return error.message || 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error) => {
  return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
};

export const isCorsError = (error) => {
  return error.message?.includes('CORS') || 
         (error.code === 'ERR_NETWORK' && !navigator.onLine === false);
};

export const getDebugInfo = (error) => {
  return {
    code: error.code,
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  };
};