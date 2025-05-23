import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { favoritesApi } from '../../utils/api'
import { createFavoritesStore } from '../../utils/favorites'
import './FavoriteButton.scss'

interface FavoriteButtonProps {
    articleId: number
}

const FavoriteButton = ({ articleId }: FavoriteButtonProps) => {
    const [isFavorite, setIsFavorite] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    // Добавляем состояние для показа уведомления об ошибке
    const [apiError, setApiError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    
    // Создаем локальное хранилище избранных статей для быстрого доступа
    const favoritesStore = user ? createFavoritesStore(user.id) : null;

    useEffect(() => {
        // Очищаем ошибку при монтировании/изменении статьи
        setApiError(null);
        
        if (user && favoritesStore) {
            // Сразу устанавливаем состояние из localStorage для быстроты
            const isLocalFavorite = favoritesStore.isFavorite(articleId)
            setIsFavorite(isLocalFavorite)
            
            // При входе/изменении пользователя проверяем актуальное состояние избранного
            console.log(`Checking favorite status for article #${articleId}, user: ${user.id}`);
        }
    }, [user, articleId, favoritesStore])

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Очищаем предыдущую ошибку при новом действии
        setApiError(null);

        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login...');
            navigate('/login', { state: { from: window.location.pathname } })
            return
        }

        if (isProcessing || !favoritesStore) return;
        
        try {
            setIsProcessing(true)
            
            // Обновляем состояние UI мгновенно
            const newIsFavorite = !isFavorite
            setIsFavorite(newIsFavorite)
            
            console.log(`${newIsFavorite ? 'Adding' : 'Removing'} article #${articleId} ${newIsFavorite ? 'to' : 'from'} favorites...`);
            
            // Выполняем действие
            if (newIsFavorite) {
                await favoritesApi.addToFavorites(articleId)
                console.log(`Article #${articleId} added to favorites successfully`);
            } else {
                await favoritesApi.removeFromFavorites(articleId)
                console.log(`Article #${articleId} removed from favorites successfully`);
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            // Даже в случае ошибки API, пользовательский интерфейс уже обновлен
            // и данные сохранены в localStorage, поэтому UI не меняем
            setApiError(error instanceof Error ? error.message : 'Ошибка при обновлении избранного');
            
            // Показываем уведомление об ошибке на 3 секунды
            setTimeout(() => setApiError(null), 3000);
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <button 
                className={`favoriteButton ${isFavorite ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
                onClick={handleClick}
                disabled={isProcessing}
                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-article-id={articleId}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
                        fill={isFavorite ? '#FF4D4D' : 'none'} 
                        stroke={isFavorite ? '#FF4D4D' : '#666'} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {apiError && (
                <div className="favorite-error-tooltip">
                    {apiError}
                </div>
            )}
        </>
    )
}

export default FavoriteButton 