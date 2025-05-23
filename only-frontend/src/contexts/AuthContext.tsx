import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../api/auth';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    updateProfile: (data: { firstName: string; lastName: string }) => Promise<void>;
    updateUser: (user: User) => void;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    setIsAuthenticated: (isAuth: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return !!localStorage.getItem('access_token');
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    });

    useEffect(() => {
        // Флаг для предотвращения повторной инициализации
        let isInitializing = false;
        // Флаг для отслеживания размонтирования компонента
        let isMounted = true;
        
        const initAuth = async () => {
            if (isInitializing) return;
            
            try {
                isInitializing = true;
                setIsLoading(true);
                
                console.log('AuthContext: Initializing authentication...');
                const accessToken = localStorage.getItem('access_token');
                const refreshToken = localStorage.getItem('refresh_token');

                if (accessToken) {
                    console.log('AuthContext: Found access token, validating...');
                    try {
                        // Пытаемся получить данные пользователя с текущим токеном
                        const userData = await AuthAPI.getCurrentUser();
                        
                        // Проверяем, что компонент всё еще смонтирован
                        if (!isMounted) return;
                        
                        console.log('AuthContext: User data received successfully');
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error('AuthContext: Failed to validate token:', error);
                        
                        // Если токен недействителен и есть refresh token, пробуем обновить
                        if (refreshToken) {
                            console.log('AuthContext: Attempting token refresh');
                            try {
                                const { access } = await AuthAPI.refreshToken();
                                console.log('AuthContext: Token refreshed successfully');
                                
                                // Проверяем, что компонент всё еще смонтирован
                                if (!isMounted) return;
                                
                                // Повторяем запрос данных пользователя с новым токеном
                                try {
                                    const userData = await AuthAPI.getCurrentUser();
                                    
                                    // Проверяем, что компонент всё еще смонтирован
                                    if (!isMounted) return;
                                    
                                    console.log('AuthContext: User data received with refreshed token');
                                    setUser(userData);
                                    localStorage.setItem('user', JSON.stringify(userData));
                                    setIsAuthenticated(true);
                                } catch (userError) {
                                    console.error('AuthContext: Failed to get user data after refresh:', userError);
                                    handleAuthFailure();
                                }
                            } catch (refreshError) {
                                console.error('AuthContext: Failed to refresh token:', refreshError);
                                if (isMounted) handleAuthFailure();
                            }
                        } else {
                            console.error('AuthContext: No refresh token available');
                            if (isMounted) handleAuthFailure();
                        }
                    }
                } else {
                    console.log('AuthContext: No access token found');
                    if (isMounted) handleAuthFailure();
                }
            } catch (err) {
                console.error('AuthContext: Unexpected error during initialization:', err);
                if (isMounted) handleAuthFailure();
            } finally {
                isInitializing = false;
                if (isMounted) setIsLoading(false);
            }
        };

        // Вспомогательная функция для обработки ошибок авторизации
        const handleAuthFailure = () => {
            console.log('AuthContext: Clearing auth data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        };

        initAuth();
        
        // Очистка при размонтировании
        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setError(null);
            setIsLoading(true);
            console.log('Attempting login...');
            const { access, refresh, user } = await AuthAPI.login(credentials);
            console.log('Login successful, saving tokens and user data');
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Временно сохраняем данные пользователя из ответа
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
            
            // Дополнительно запрашиваем полные данные пользователя (включая аватар)
            try {
                console.log('Fetching complete user data after login...');
                const completeUserData = await AuthAPI.getCurrentUser();
                console.log('Complete user data received:', completeUserData);
                setUser(completeUserData);
                localStorage.setItem('user', JSON.stringify(completeUserData));
            } catch (userError) {
                console.error('Failed to fetch complete user data:', userError);
                // Продолжаем с базовыми данными, не прерываем процесс входа
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при входе');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            setError(null);
            setIsLoading(true);
            console.log('Attempting registration...');
            await AuthAPI.register(credentials);
            console.log('Registration successful, attempting login...');
            const { access, refresh, user } = await AuthAPI.login({
                email: credentials.email,
                password: credentials.password
            });
            console.log('Login after registration successful, saving tokens and user data');
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Временно сохраняем данные пользователя из ответа
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
            
            // Дополнительно запрашиваем полные данные пользователя (включая аватар)
            try {
                console.log('Fetching complete user data after registration...');
                const completeUserData = await AuthAPI.getCurrentUser();
                console.log('Complete user data received:', completeUserData);
                setUser(completeUserData);
                localStorage.setItem('user', JSON.stringify(completeUserData));
            } catch (userError) {
                console.error('Failed to fetch complete user data:', userError);
                // Продолжаем с базовыми данными, не прерываем процесс входа
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при регистрации');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setError(null);
            setIsLoading(true);
            console.log('Attempting logout...');
            await AuthAPI.logout();
            console.log('Logout successful, clearing local storage');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        } catch (err) {
            console.error('Logout failed:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при выходе');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const requestPasswordReset = async (email: string) => {
        try {
            setError(null);
            setIsLoading(true);
            await AuthAPI.requestPasswordReset(email);
        } catch (error) {
            console.error('Error requesting password reset:', error);
            setError(error instanceof Error ? error.message : 'Ошибка при запросе сброса пароля');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (token: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);
            await AuthAPI.resetPassword(token, password);
        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error instanceof Error ? error.message : 'Ошибка при сбросе пароля');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: { firstName: string; lastName: string }) => {
        try {
            setError(null);
            setIsLoading(true);
            const updatedUser = await AuthAPI.updateProfile(data);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при обновлении профиля');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const clearError = () => setError(null);

    const changePassword = async (oldPassword: string, newPassword: string) => {
        try {
            setError(null);
            setIsLoading(true);
            await AuthAPI.changePassword(oldPassword, newPassword);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при изменении пароля');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateAuthStatus = (isAuth: boolean) => {
        console.log(`Setting authentication state to: ${isAuth}`);
        
        if (isAuth) {
            // Только устанавливаем флаг аутентификации, но не трогаем токены
            // Токены должны быть установлены до вызова этой функции
            if (!localStorage.getItem('access_token')) {
                console.warn('Setting isAuthenticated to true, but no access token found');
            }
            setIsAuthenticated(true);
        } else {
            // Если выходим из системы, очищаем все данные аутентификации
            console.log('Clearing authentication data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            error,
            isAuthenticated,
            login,
            register,
            logout,
            clearError,
            requestPasswordReset,
            resetPassword,
            updateProfile,
            updateUser,
            changePassword,
            setIsAuthenticated: updateAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 