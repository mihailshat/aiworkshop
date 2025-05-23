import axios from 'axios';
import { createFavoritesStore } from './favorites';

// Базовый URL API - приведен в соответствие с auth.ts
const API_URL = 'http://127.0.0.1:8000';
const API_PREFIX = '/api'; // Добавляем префикс для путей API

// Соответствие между id и slug статей
const ARTICLE_SLUGS = {
    1: 'deepl',
    2: 'palette',
    3: 'yandex-gpt',
    4: 'perceptron',
    5: 'chatgpt',
    6: 'gigachat',
};

// Флаг для предотвращения множественных параллельных попыток обновления токена 
let isRefreshing = false;
// Очередь запросов, ожидающих обновления токена
let refreshSubscribers: Function[] = [];

// Функция для подписки запросов, ожидающих обновления токена
const subscribeTokenRefresh = (cb: Function) => {
    refreshSubscribers.push(cb);
}

// Функция для оповещения всех ожидающих запросов
const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
}

// Функция для очистки данных аутентификации
const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Не используем window.location.href для предотвращения полной перезагрузки
    // Вместо этого будет использоваться React Router в компонентах
    isRefreshing = false;
    refreshSubscribers = [];
}

// Создаем базовый экземпляр axios с интерцепторами
export const createAPI = () => {
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Добавляем перехватчик запросов для добавления токена авторизации
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                // Проверяем точно формат заголовка авторизации
                config.headers.Authorization = `Bearer ${token}`;
                console.log('API Request with auth:', config.url);
            } else {
                console.log('API Request without auth:', config.url);
            }
            return config;
        },
        (error) => {
            console.error('API Request error:', error);
            return Promise.reject(error);
        }
    );

    // Добавляем перехватчик ответов для обработки 401 ошибок и обновления токена
    api.interceptors.response.use(
        (response) => {
            console.log('API Response success:', response.config.url);
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            console.error('API Response error:', error.config?.url, error.response?.status, error.message);
            
            // Проверяем, это ошибка 401 и не запрос на обновление токена
            if (
                error.response?.status === 401 && 
                !originalRequest._retry && 
                !originalRequest.url?.includes('auth/token/refresh')
            ) {
                // Если уже идет процесс обновления токена, добавляем текущий запрос в очередь
                if (isRefreshing) {
                    console.log('Token refresh already in progress, adding request to queue');
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((token: string) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        });
                    });
                }
                
                // Помечаем запрос как повторяемый и начинаем обновление токена
                originalRequest._retry = true;
                isRefreshing = true;
                
                console.log('Attempting to refresh token for request', originalRequest.url);
                
                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (!refreshToken) {
                        console.log('No refresh token found, clearing auth data');
                        clearAuthData();
                        return Promise.reject(error);
                    }
                    
                    // Важно: Используем чистый axios, а не наш api с интерцепторами
                    const refreshResponse = await axios.post(
                        `${API_URL}${API_PREFIX}/auth/token/refresh/`, 
                        { refresh: refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    if (refreshResponse.data && refreshResponse.data.access) {
                        const newToken = refreshResponse.data.access;
                        console.log('Successfully received new access token');
                        
                        // Обновляем токен в localStorage
                        localStorage.setItem('access_token', newToken);
                        
                        // Обновляем заголовки для API
                        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        
                        // Оповещаем всех подписчиков
                        onTokenRefreshed(newToken);
                        
                        // Сбрасываем флаг
                        isRefreshing = false;
                        
                        // Повторяем исходный запрос с новым токеном
                        return api(originalRequest);
                    } else {
                        console.error('Refresh response does not contain a valid token');
                        clearAuthData();
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    clearAuthData();
                    isRefreshing = false;
                    return Promise.reject(error);
                }
            }
            
            // Если это не 401 ошибка или запрос уже был повторен
            return Promise.reject(error);
        }
    );

    return api;
};

// Методы для работы с избранными статьями
export const favoritesApi = {
    // Получение списка избранных статей
    getFavorites: async () => {
        try {
            const api = createAPI();
            const response = await api.get(`${API_PREFIX}/favorites/`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении избранных статей:', error);
            // Используем localStorage как резервный вариант
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user && user.id) {
                const favStore = createFavoritesStore(user.id);
                const favoriteIds = favStore.getFavorites();
                return favoriteIds.map(id => ({ article: { id } }));
            }
            return [];
        }
    },
    
    // Проверка статуса избранного для конкретной статьи
    isFavorite: async (articleId: number) => {
        // Используем localStorage напрямую для быстродействия
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.id) {
            const favStore = createFavoritesStore(user.id);
            return favStore.isFavorite(articleId);
        }
        return false;
    },
    
    // Добавление статьи в избранное
    addToFavorites: async (articleId: number) => {
        // Всегда обновляем localStorage (быстрая реакция UI)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.id) {
            const favStore = createFavoritesStore(user.id);
            favStore.addToFavorites(articleId);
        }
        
        try {
            // Затем пытаемся обновить через API
            const api = createAPI();
            console.log(`Добавление в избранное статьи ${articleId} - отправка запроса`);
            
            // Используем прямой URL для статьи, либо идентификатор
            const slug = ARTICLE_SLUGS[articleId as keyof typeof ARTICLE_SLUGS];
            let url;
            
            if (slug) {
                // Используем прямой URL в формате /api/deepl/add_favorites/
                url = `${API_PREFIX}/${slug}/add_favorites/`;
                console.log(`Используем прямой URL со slug '${slug}' для статьи #${articleId}`);
            } else {
                // Используем ID-версию URL
                url = `${API_PREFIX}/articles/${articleId}/add_to_favorites/`;
            }
            
            console.log(`Полный URL запроса: ${API_URL}${url}`);
            const response = await api.post(url);
            console.log(`Статья ${articleId} успешно добавлена в избранное через API`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при добавлении статьи #${articleId} в избранное через API:`, error);
            // Локальное хранилище уже обновлено, поэтому просто возвращаем успех
            return { status: 'added to favorites (local)' };
        }
    },
    
    // Удаление статьи из избранного
    removeFromFavorites: async (articleId: number) => {
        // Всегда обновляем localStorage (быстрая реакция UI)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.id) {
            const favStore = createFavoritesStore(user.id);
            favStore.removeFromFavorites(articleId);
        }
        
        try {
            // Затем пытаемся обновить через API
            const api = createAPI();
            console.log(`Удаление из избранного статьи ${articleId} - отправка запроса`);
            
            // Используем прямой URL для статьи, либо идентификатор
            const slug = ARTICLE_SLUGS[articleId as keyof typeof ARTICLE_SLUGS];
            let url;
            
            if (slug) {
                // Используем прямой URL в формате /api/deepl/remove_favorites/
                url = `${API_PREFIX}/${slug}/remove_favorites/`;
                console.log(`Используем прямой URL со slug '${slug}' для статьи #${articleId}`);
            } else {
                // Используем ID-версию URL
                url = `${API_PREFIX}/articles/${articleId}/remove_from_favorites/`;
            }
            
            console.log(`Полный URL запроса: ${API_URL}${url}`);
            const response = await api.post(url);
            console.log(`Статья ${articleId} успешно удалена из избранного через API`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении статьи #${articleId} из избранного через API:`, error);
            // Локальное хранилище уже обновлено, поэтому просто возвращаем успех
            return { status: 'removed from favorites (local)' };
        }
    }
};

// Методы для работы с пользователями
export const userApi = {
    // Получение информации о текущем пользователе
    getMe: async () => {
        try {
            const api = createAPI();
            console.log('Запрос информации о текущем пользователе');
            const url = `${API_PREFIX}/me/`;
            console.log(`Полный URL запроса: ${API_URL}${url}`);
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            throw error;
        }
    },
    
    // Обновление аватара пользователя
    updateAvatar: async (avatarData: string) => {
        try {
            const api = createAPI();
            const url = `${API_PREFIX}/users/update_avatar/`;
            const response = await api.post(url, { avatar: avatarData });
            return response.data;
        } catch (error) {
            console.error('Ошибка при обновлении аватара:', error);
            throw error;
        }
    }
};

export default { createAPI, favoritesApi, userApi }; 