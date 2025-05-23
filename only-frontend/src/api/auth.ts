import { LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { createAPI } from '../utils/api';

// Исправляем URL API и делаем константу единой для всех
const API_URL = 'http://127.0.0.1:8000';
const API_PREFIX = '/api';

// Создаем общий экземпляр API
const api = createAPI();

// Переменная для кэширования текущего пользователя, чтобы избежать повторных запросов
let currentUserCache: User | null = null;
let lastUserFetchTime = 0;
const CACHE_TTL = 5000; // Кэш действителен в течение 5 секунд

class AuthAPI {
    // Используем общий API вместо собственного управления заголовками
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {},
        requireAuth = true
    ): Promise<T> {
        console.log(`Making request to ${endpoint}`, {
            method: options.method,
            body: options.body ? '[DATA]' : undefined,
            requireAuth
        });

        const fullUrl = `${API_PREFIX}${endpoint}`;
        console.log(`Full request URL: ${API_URL}${fullUrl}`);
        
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            const response = await api.request({
                url: fullUrl,
                method: options.method || 'GET',
                headers,
                data: options.body ? JSON.parse(options.body as string) : undefined,
            });

            return response.data;
        } catch (error) {
            console.error(`Error with request to ${fullUrl}:`, error);
            throw error;
        }
    }

    static async login(credentials: LoginCredentials): Promise<{ access: string; refresh: string; user: User }> {
        const response = await this.request<{ access: string; refresh: string; user: User }>('/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }, false);

        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));

        return response;
    }

    static async register(credentials: RegisterCredentials): Promise<void> {
        console.log('Registering with credentials:', {
            ...credentials,
            password: '***',
            password2: '***'
        });
        
        return this.request('/register/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }, false);
    }

    static async logout(): Promise<void> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                return;
            }
            await this.request('/logout/', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Очищаем локальное хранилище в любом случае
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    }

    static async getCurrentUser(): Promise<User> {
        console.log('Getting current user...');
        
        // Проверяем кэш
        const now = Date.now();
        if (currentUserCache && (now - lastUserFetchTime) < CACHE_TTL) {
            console.log('Using cached user data');
            return currentUserCache;
        }
        
        try {
            const response = await this.request<User>('/me/');
            console.log('Current user data received:', response);
            
            // Обновляем кэш
            currentUserCache = response;
            lastUserFetchTime = now;
            
            return response;
        } catch (error) {
            console.error('Error getting current user:', error);
            currentUserCache = null; // Очищаем кэш при ошибке
            throw error;
        }
    }

    static async refreshToken(): Promise<{ access: string }> {
        console.log('Refreshing token...');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await api.post(`${API_PREFIX}/auth/token/refresh/`, {
                refresh: refreshToken
            });
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            return { access };
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    static async requestPasswordReset(email: string): Promise<void> {
        console.log('Requesting password reset...');
        
        return this.request('/forgot-password/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }, false);
    }

    static async resetPassword(token: string, password: string): Promise<void> {
        console.log('Resetting password...');
        
        return this.request('/reset-password/', {
            method: 'POST',
            body: JSON.stringify({ token, password, password2: password }),
        }, false);
    }

    static async updateProfile(data: { firstName: string; lastName: string }): Promise<User> {
        return this.request<User>('/users/me/', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        return this.request<void>('/users/change_password/', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
                new_password_confirm: newPassword
            }),
        });
    }
}

export { AuthAPI }; 