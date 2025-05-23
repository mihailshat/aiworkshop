import { useContext, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Context } from '../../App'
import { ArticleStorageType } from '../../types/ArticleStorageType'
import OnTrendArticlesItem from '../../components/OnTrendArticleItem/OnTrendArticleItem'
import classes from './Profile.module.scss'
import { observer } from 'mobx-react-lite'
import { ArticleType } from '../../types/ArticleType'
import axios from 'axios'
import { favoritesApi, userApi } from '../../utils/api'
import { createFavoritesStore } from '../../utils/favorites'

const API_URL = 'https://aiworkshop-production.up.railway.app'

// Создаем экземпляр axios с настроенными заголовками
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Добавляем перехватчик для добавления токена к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Добавляем перехватчик для обработки ошибок и обновления токена
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const refreshToken = localStorage.getItem('refresh_token')
                const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
                    refresh: refreshToken
                })
                if (response.data.access) {
                    localStorage.setItem('access_token', response.data.access)
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

const Profile = observer(() => {
    const { user, logout, updateUser, setIsAuthenticated } = useAuth()
    const navigate = useNavigate()
    const context = useContext(Context) as ArticleStorageType
    const { articleStorage } = context
    const [favoriteArticles, setFavoriteArticles] = useState<ArticleType[]>([])
    const [avatar, setAvatar] = useState<string>('')
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [dataFetched, setDataFetched] = useState(false) // Флаг для отслеживания загрузки данных

    useEffect(() => {
        // Выполняем только при монтировании компонента или изменении ID пользователя
        if (!user || dataFetched) {
            return
        }

        const controller = new AbortController();
        
        const fetchAllData = async () => {
            try {
                console.log('Загрузка данных пользователя...')
                
                // 1. Получаем данные пользователя
                const userData = await userApi.getMe()
                console.log('Received user data:', userData)
                
                // Обновляем аватар только если он действительно изменился
                if (userData.avatar_url && userData.avatar_url !== avatar) {
                    setAvatar(userData.avatar_url)
                }
                
                // 2. Получаем избранные статьи
                const favoritesStore = createFavoritesStore(user.id)
                const allArticles = articleStorage.getArticles()
                let favoriteIds: number[] = []
                
                // Используем локальные данные
                favoriteIds = favoritesStore.getFavorites()
                
                try {
                    // Пытаемся получить данные из API
                    const apiFavorites = await favoritesApi.getFavorites()
                    
                    if (Array.isArray(apiFavorites) && apiFavorites.length > 0) {
                        const apiIds = apiFavorites.map((fav: any) => fav.article.id)
                        favoriteIds = apiIds
                    }
                } catch (err) {
                    console.error('Ошибка при загрузке избранного:', err)
                }
                
                // Отображаем статьи
                const favoriteArticlesData = allArticles.filter(article => 
                    favoriteIds.includes(article.id)
                )
                setFavoriteArticles(favoriteArticlesData)
                
                // Отмечаем, что данные загружены
                setDataFetched(true)
                
            } catch (err: any) {
                console.error('Ошибка при загрузке данных:', err)
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                    updateUser(undefined as any)
                    setIsAuthenticated(false)
                    navigate('/login')
                }
            }
        }
        
        fetchAllData()
        
        return () => {
            controller.abort()
        }
        
    }, [user?.id, dataFetched]) // Минимальное количество зависимостей

    // Сбрасываем флаг загрузки данных при смене пользователя
    useEffect(() => {
        setDataFetched(false)
    }, [user?.id])

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout/')
        } catch (err) {
            console.error('Error during logout:', err)
        } finally {
            logout()
            navigate('/login')
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && user) {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const result = reader.result as string
                try {
                    // Используем API-утилиту
                    const response = await userApi.updateAvatar(result)
                    console.log('Avatar update response:', response)
                    
                    // Используем data_url из ответа API, если он есть
                    let avatarToUse = null
                    
                    // Приоритетно используем base64 данные, если они доступны
                    if (response.avatar_data_url) {
                        avatarToUse = response.avatar_data_url
                        console.log('Using base64 avatar data from response')
                    } else if (response.avatar_url || response.avatar) {
                        avatarToUse = response.avatar_url || response.avatar
                        console.log('Using avatar URL from response')
                    } else {
                        console.error('Avatar URL not found in response:', response)
                        return
                    }
                    
                    // Устанавливаем аватар в состояние компонента
                    setAvatar(avatarToUse)
                    
                    // Обновляем пользователя в контексте с новыми данными аватара
                    const updatedUser = { 
                        ...user, 
                        avatar: avatarToUse,
                        avatar_url: avatarToUse,
                        avatar_base64: response.avatar_base64, // Добавляем base64 данные
                        avatar_data_url: response.avatar_data_url // Добавляем полный data URL
                    }
                    updateUser(updatedUser)
                    localStorage.setItem('user', JSON.stringify(updatedUser))
                    
                    // Показываем сообщение об успешном обновлении
                    setSuccess('Аватар успешно обновлен')
                    setTimeout(() => setSuccess(null), 3000)
                } catch (err: any) {
                    console.error('Error updating avatar:', err)
                    setError('Ошибка при обновлении аватара')
                    setTimeout(() => setError(null), 3000)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Новые пароли не совпадают')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError('Новый пароль должен содержать минимум 6 символов')
            return
        }

        try {
            await api.post('/api/users/change_password/', {
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword,
                new_password_confirm: passwordData.confirmPassword
            })
            setSuccess('Пароль успешно изменен')
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setShowPasswordForm(false)
        } catch (err: any) {
            if (err.response?.data?.old_password) {
                setError('Неверный текущий пароль')
            } else if (err.response?.data?.new_password) {
                setError(err.response.data.new_password[0])
            } else {
                setError('Ошибка при изменении пароля')
            }
        }
    }

    const getArticlePath = (id: number) => {
        switch(id) {
            case 1: return '/deepl';
            case 2: return '/palette';
            case 3: return '/yandex-gpt';
            case 4: return '/perceptron';
            case 5: return '/chatgpt';
            case 6: return '/gigachat';
            default: return '/';
        }
    }

    if (!user) return null

    return (
        <div className={classes.profileContainer}>
            <div className={classes.profileHeader}>
                <div className={classes.avatarSection}>
                    <div className={classes.avatarWrapper}>
                        <img 
                            src={
                                avatar || 
                                user?.avatar_data_url || // Добавляем data URL с base64
                                user?.avatar_url || 
                                user?.avatar || 
                                'https://via.placeholder.com/150'
                            } 
                            alt="Profile" 
                            className={classes.avatar}
                        />
                        <label className={classes.avatarUpload}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                            <span>Изменить фото</span>
                        </label>
                    </div>
                </div>
                <div className={classes.userInfo}>
                    <h1>{user.email}</h1>
                    <div className={classes.userStats}>
                        <div className={classes.statItem}>
                            <span className={classes.statValue}>{favoriteArticles.length}</span>
                            <span className={classes.statLabel}>Избранных статей</span>
                        </div>
                    </div>
                    <div className={classes.actionButtons}>
                        <button 
                            onClick={() => setShowPasswordForm(!showPasswordForm)} 
                            className={classes.changePasswordButton}
                        >
                            {showPasswordForm ? 'Отмена' : 'Изменить пароль'}
                        </button>
                        <button onClick={handleLogout} className={classes.logoutButton}>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>

            {showPasswordForm && (
                <div className={classes.passwordFormContainer}>
                    <form onSubmit={handlePasswordSubmit} className={classes.passwordForm}>
                        <h3>Изменение пароля</h3>
                        {error && <div className={classes.error}>{error}</div>}
                        {success && <div className={classes.success}>{success}</div>}
                        <div className={classes.formGroup}>
                            <label htmlFor="oldPassword">Текущий пароль</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className={classes.formGroup}>
                            <label htmlFor="newPassword">Новый пароль</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className={classes.formGroup}>
                            <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button type="submit" className={classes.submitButton}>
                            Изменить пароль
                        </button>
                    </form>
                </div>
            )}

            <div className={classes.favoritesSection}>
                <h2>Избранные статьи</h2>
                {favoriteArticles.length > 0 ? (
                    <div className={classes.favoritesGrid}>
                        {favoriteArticles.map(article => (
                            <Link 
                                to={getArticlePath(article.id)} 
                                key={article.id} 
                                className={classes.articleWrapper}
                            >
                                <OnTrendArticlesItem 
                                    article={article}
                                    className={classes.favoriteArticle}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={classes.emptyState}>
                        <p>У вас пока нет избранных статей</p>
                        <button 
                            onClick={() => navigate('/feed')} 
                            className={classes.browseButton}
                        >
                            Перейти к статьям
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
})

export default Profile 