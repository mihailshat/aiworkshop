from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
import re
import base64
from django.core.files.storage import default_storage
import os

class PublicEndpointsMiddleware(MiddlewareMixin):
    """
    Middleware для обработки публичных эндпоинтов.
    Позволяет отключить проверку аутентификации для указанных URL.
    """

    def process_request(self, request):
        """
        Проверяет, является ли текущий URL публичным,
        и если да, то отключает проверку аутентификации.
        """
        # Всегда пропускаем OPTIONS запросы
        if request.method == 'OPTIONS':
            return None

        path = request.path_info.lstrip('/')
        print(f"[PublicEndpointsMiddleware] Processing request: {request.method} {path}")
        
        # Проверяем, является ли URL публичным
        for endpoint in getattr(settings, 'PUBLIC_ENDPOINTS', []):
            if endpoint in path:
                print(f"[PublicEndpointsMiddleware] Found public endpoint: {path}")
                setattr(request, '_public_endpoint', True)
                # Отключаем проверку аутентификации для публичных эндпоинтов
                setattr(request, '_dont_enforce_csrf_checks', True)
                return None
        
        print(f"[PublicEndpointsMiddleware] Not a public endpoint: {path}")
        return None

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Проверяет, является ли текущий URL публичным,
        и если да, то пропускает проверку аутентификации.
        """
        # Всегда пропускаем OPTIONS запросы
        if request.method == 'OPTIONS':
            return None
            
        if getattr(request, '_public_endpoint', False):
            print(f"[PublicEndpointsMiddleware] Skipping authentication for public endpoint")
            return None
            
        return None

class AvatarBase64Middleware:
    """
    Middleware для автоматической конвертации аватарок в base64 формат
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Выполняем код до обработки запроса
        if request.user.is_authenticated and hasattr(request.user, 'avatar') and request.user.avatar:
            # Проверяем, нужна ли конвертация
            if ((hasattr(request.user, 'avatar_base64') and not request.user.avatar_base64) or 
                (hasattr(request.user, 'avatar_content_type') and not request.user.avatar_content_type)):
                self.convert_avatar_to_base64(request.user)
        
        # Передаем управление следующему middleware или представлению
        response = self.get_response(request)
        
        return response
    
    def convert_avatar_to_base64(self, user):
        """
        Конвертирует аватарку пользователя в base64 формат
        """
        try:
            if user.avatar and hasattr(user.avatar, 'name') and user.avatar.name:
                # Получаем путь к файлу
                file_path = user.avatar.name
                
                # Проверяем существование файла
                if default_storage.exists(file_path):
                    # Определяем тип контента на основе расширения файла
                    _, ext = os.path.splitext(file_path)
                    content_type = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.gif': 'image/gif',
                        '.webp': 'image/webp',
                        '.svg': 'image/svg+xml'
                    }.get(ext.lower(), 'image/jpeg')
                    
                    # Читаем файл и кодируем в base64
                    with default_storage.open(file_path, 'rb') as f:
                        file_content = f.read()
                        base64_data = base64.b64encode(file_content).decode('utf-8')
                        
                        # Сохраняем в полях модели
                        user.avatar_base64 = base64_data
                        user.avatar_content_type = content_type
                        user.save(update_fields=['avatar_base64', 'avatar_content_type'])
                        
                        print(f"[AvatarBase64Middleware] Avatar successfully converted to base64 for user {user.email}")
        except Exception as e:
            print(f"[AvatarBase64Middleware] Error converting avatar to base64: {str(e)}") 