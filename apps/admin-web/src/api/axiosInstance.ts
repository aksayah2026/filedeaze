import axios, { AxiosError } from 'axios';

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
    // Backend sends HTTP 200 with statusCode 401 in body for auth errors
    const data = response.data;
    if (data && data.statusCode === 401 && !response.config.url?.includes('/auth/')) {
      console.warn('[Axios] Body-level 401 detected for:', response.config.url);
      // Attempt token refresh
      return handleTokenRefresh(response.config);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // HTTP-level 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return handleTokenRefresh(originalRequest);
    }

    const message = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

async function handleTokenRefresh(originalConfig: any) {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
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
      return axiosInstance(originalConfig);
    } else {
      throw new Error('No token in refresh response');
    }
  } catch (refreshError) {
    console.error('[Axios] Token refresh failed, logging out');
    clearAuthAndRedirect();
    return Promise.reject(refreshError);
  }
}

function clearAuthAndRedirect() {
  localStorage.clear();
  // Clear Zustand store without triggering window.location in logout()
  try {
    const { useAuthStore } = require('../store/authStore');
    useAuthStore.getState().logout();
  } catch {
    window.location.href = '/login';
  }
}

export default axiosInstance;
