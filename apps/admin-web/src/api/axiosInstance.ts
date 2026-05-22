import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Injecting token for:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle body-level 401s and HTTP 401s
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;
    console.log('[Axios Response Log] URL:', response.config.url, '| Data:', data);
    
    if (data && data.statusCode === 401 && !response.config.url?.includes('/auth/')) {
      console.warn('[Axios Body-Level 401 Warning] URL:', response.config.url);
      return handleTokenRefresh(response.config);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    console.error('[Axios Error Interceptor Log] Failed URL:', originalRequest?.url, '| Status:', error.response?.status, '| Error:', error);

    // HTTP-level 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      console.warn('[Axios HTTP-Level 401 Warning] Retrying/refreshing token for URL:', originalRequest?.url);
      return handleTokenRefresh(originalRequest);
    }

    // HTTP-level 403 Forbidden
    if (error.response?.status === 403) {
      const msg = (error.response?.data as any)?.message || 'Access Denied: You do not have permission to view this resource.';
      console.error('[Axios HTTP-Level 403 Forbidden Error] Access denied for URL:', originalRequest?.url, '| Message:', msg);
      toast.error(msg);
      return Promise.reject(new Error(msg));
    }

    const message = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
    console.error('[Axios Response Failure Log] URL:', originalRequest?.url, '| Error message:', message);
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

async function handleTokenRefresh(originalConfig: any) {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('[Axios Refresh Token Check] No refresh token found in localStorage! Calling clearAuthAndRedirect...');
    console.trace('AUTO LOGOUT TRIGGERED (Reason: No refresh token available)');
    clearAuthAndRedirect();
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    console.log('[Axios] Attempting token refresh...');
    const response = await axios.post(`${API_URL}/public/auth/refresh`, { refreshToken });
    const { token, accessToken } = response.data?.data || {};
    const finalToken = token || accessToken;

    if (finalToken) {
      console.log('[Axios] Token refreshed successfully');
      localStorage.setItem('token', finalToken);
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${finalToken}`;
      originalConfig._retry = true;
      return axiosInstance(originalConfig);
    } else {
      throw new Error('No token in refresh response');
    }
  } catch (refreshError: any) {
    console.error('[Axios] Token refresh failed for URL:', originalConfig?.url, '| Error:', refreshError);
    console.trace('AUTO LOGOUT TRIGGERED (Reason: Token refresh request failed)');
    clearAuthAndRedirect();
    return Promise.reject(refreshError);
  }
}

function clearAuthAndRedirect() {
  console.warn('[Axios clearAuthAndRedirect] Clearing credentials and logging out.');
  localStorage.clear();
  useAuthStore.getState().logout();
}

export default axiosInstance;
