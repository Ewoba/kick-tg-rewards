import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
// Для реального устройства или ngrok: https://ваш-ngrok-url.ngrok-free.app
export const API_BASE = 'http://10.0.2.2:3000';

// Проверка подключения к backend
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE}/health`, {
      timeout: 5000,
    });
    return response.data?.ok === true;
  } catch {
    return false;
  }
}

// Создание axios instance с авторизацией
export async function createApiClient(): Promise<AxiosInstance> {
  const token = await SecureStore.getItemAsync('appToken');

  const client = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Interceptor для обработки 401
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token истек или невалиден - очистить и редирект на Auth
        await SecureStore.deleteItemAsync('appToken');
        // Можно добавить событие для навигации
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Обертка для API запросов с обработкой ошибок
export async function apiRequest<T>(
  request: () => Promise<T>,
  onError?: (error: AxiosError) => void
): Promise<T | null> {
  try {
    return await request();
  } catch (error: any) {
    console.error('API request error:', error);
    if (onError) {
      onError(error);
    }
    return null;
  }
}
