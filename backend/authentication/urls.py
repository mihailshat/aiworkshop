from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, ArticleViewSet, CommentViewSet,
    FavoriteArticleViewSet, RegisterView, LoginView,
    LogoutView, forgot_password_view, ResetPasswordView,
    debug_view, add_to_favorites_by_slug, remove_from_favorites_by_slug,
    is_favorite_by_slug, convert_avatars_api
)
from django.core.management import call_command
from django.http import HttpResponse

# Создаем основной маршрутизатор
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'favorites', FavoriteArticleViewSet, basename='favorite')

# Добавляем функцию для запуска миграций через URL
def run_migrations(request):
    """Аварийный эндпоинт для запуска миграций"""
    try:
        print(f"[DEBUG] Starting migrations via URL endpoint...")
        # Добавляем CORS-заголовки
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        # Запускаем миграции
        call_command('migrate')
        
        # Возвращаем успешный ответ
        response.content = "Migrations completed successfully"
        response.status_code = 200
        return response
    except Exception as e:
        print(f"[DEBUG ERROR] Migration error: {str(e)}")
        
        # Возвращаем ошибку с CORS-заголовками
        response = HttpResponse(f"Migration error: {str(e)}")
        response.status_code = 500
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

# Определяем все URL-маршруты
urlpatterns = [
    # Включаем все URL из роутера
    path('', include(router.urls)),
    
    # Тестовый маршрут для проверки API
    path('debug/', debug_view, name='debug'),
    
    # Аутентификация
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('forgot-password/', forgot_password_view, name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Маршруты для избранного по числовому ID
    path('articles/<int:pk>/add_to_favorites/', ArticleViewSet.as_view({'post': 'add_to_favorites'}), name='add_to_favorites'),
    path('articles/<int:pk>/remove_from_favorites/', ArticleViewSet.as_view({'post': 'remove_from_favorites'}), name='remove_from_favorites'),
    path('articles/<int:pk>/is_favorite/', ArticleViewSet.as_view({'get': 'is_favorite'}), name='is_favorite'),
    
    # Аварийный маршрут для запуска миграций
    path('run-migrations/', run_migrations, name='run-migrations'),
    
    # Маршрут для конвертации аватарок в base64
    path('convert-avatars/', convert_avatars_api, name='convert-avatars'),
]

# Добавляем маршруты для действий с избранным для каждого slug напрямую
# Важно: используем одинаковые имена для всех slug-ов, чтобы не запутаться
for slug in ['deepl', 'palette', 'yandex-gpt', 'perceptron', 'chatgpt', 'gigachat']:
    urlpatterns.extend([
        # Стандартные маршруты
        path(f'{slug}/add_favorites/', add_to_favorites_by_slug, {'slug': slug}, name=f'{slug}_add_favorites'),
        path(f'{slug}/remove_favorites/', remove_from_favorites_by_slug, {'slug': slug}, name=f'{slug}_remove_favorites'),
        path(f'{slug}/is_favorite/', is_favorite_by_slug, {'slug': slug}, name=f'{slug}_is_favorite'),
        
        # Альтернативные маршруты - для совместимости
        path(f'{slug}/add-favorites/', add_to_favorites_by_slug, {'slug': slug}, name=f'{slug}_add_favorites_alt'),
        path(f'{slug}/remove-favorites/', remove_from_favorites_by_slug, {'slug': slug}, name=f'{slug}_remove_favorites_alt'),
        path(f'{slug}/is-favorite/', is_favorite_by_slug, {'slug': slug}, name=f'{slug}_is_favorite_alt'),
        
        # В случае, если frontend использует подчеркивания
        path(f'{slug}/add_to_favorites/', add_to_favorites_by_slug, {'slug': slug}, name=f'{slug}_add_to_favorites'),
        path(f'{slug}/remove_from_favorites/', remove_from_favorites_by_slug, {'slug': slug}, name=f'{slug}_remove_from_favorites'),
    ])

# Выводим все доступные URL для отладки
print("=========================================")
print("Доступные URL-маршруты в authentication.urls:")
for pattern in urlpatterns:
    print(f"  - {pattern}")
print("=========================================")
print("Основные маршруты для добавления в избранное:")
for slug in ['deepl', 'palette', 'yandex-gpt', 'perceptron', 'chatgpt', 'gigachat']:
    print(f"  - /api/{slug}/add_favorites/ [POST]")
    print(f"  - /api/{slug}/add-favorites/ [POST] (альтернативный)")
    print(f"  - /api/{slug}/add_to_favorites/ [POST] (альтернативный)")
print("=========================================")

# Выводим доступные маршруты для отладки
print("=== ДОСТУПНЫЕ МАРШРУТЫ API ===")
for pattern in urlpatterns:
    print(f"  - {pattern}")
print("==============================") 