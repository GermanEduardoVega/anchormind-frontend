import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

export const useApiClient = (getAccessTokenSilently: () => Promise<string>) => {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al adjuntar Bearer Token:', error);
    }
    return config;
  });

  return api;
};