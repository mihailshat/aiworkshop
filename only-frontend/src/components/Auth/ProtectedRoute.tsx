import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Простая проверка наличия токена в localStorage
    const hasAccessToken = localStorage.getItem('access_token') !== null;

    // Показываем загрузку, пока идет проверка аутентификации
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Если нет токена или пользователь не аутентифицирован, перенаправляем на страницу входа
    if (!isAuthenticated || !hasAccessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Пользователь аутентифицирован, показываем защищенный контент
    return <>{children}</>;
};

export default ProtectedRoute; 