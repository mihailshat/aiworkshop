from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
import re

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
            print(f"[PublicEndpointsMiddleware] Skipping authentication for public endpoint: {request.path_info}")
            return None
        
        return None 