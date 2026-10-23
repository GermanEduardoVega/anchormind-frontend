import axios from 'axios';

// Toma la variable de entorno o usa directamente la URL de Render
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://anchormind-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
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