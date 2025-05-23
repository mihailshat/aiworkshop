from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from rest_framework.request import Request
import re

class PublicEndpointMixin:
    """
    Миксин для проверки публичных эндпоинтов.
    """
    
    def is_public_endpoint(self, request):
        """
        Проверяет, является ли текущий URL публичным.
        """
        for endpoint in getattr(settings, 'PUBLIC_ENDPOINTS', []):
            if re.search(f'/{endpoint}/?', request.path_info):
                print(f"[Authentication] Found public endpoint: {request.path_info}")
                return True
        return False

class JWTAuthentication(BaseJWTAuthentication, PublicEndpointMixin):
    """
    Аутентификация JWT с поддержкой публичных эндпоинтов.
    """
    
    def authenticate(self, request):
        """
        Аутентификация пользователя.
        """
        # Если это публичный эндпоинт, пропускаем аутентификацию
        if self.is_public_endpoint(request):
            return None
        
        # Выполняем стандартную аутентификацию JWT
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed) as e:
            # Если это публичный эндпоинт, игнорируем ошибку
            if self.is_public_endpoint(request):
                return None
            raise e

class CookieJWTAuthentication(JWTAuthentication):
    """
    Аутентификация JWT с поддержкой cookie.
    """
    
    def authenticate(self, request: Request):
        """
        Аутентификация пользователя через cookie.
        """
        # Если это публичный эндпоинт, пропускаем аутентификацию
        if self.is_public_endpoint(request):
            return None
            
        # Пытаемся получить токен из cookie
        access_token = request.COOKIES.get('access_token')
        if access_token:
            # Добавляем токен в заголовок Authorization
            request.META['HTTP_AUTHORIZATION'] = f"Bearer {access_token}"
        
        # Выполняем стандартную аутентификацию JWT
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            # Если это публичный эндпоинт, игнорируем ошибку
            if self.is_public_endpoint(request):
                return None
            raise
    
    def set_auth_cookies(self, response, access_token, refresh_token):
        """
        Устанавливает куки для аутентификации.
        """
        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            samesite='Lax',
            secure=not settings.DEBUG,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        )
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            samesite='Lax',
            secure=not settings.DEBUG,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        )
        
    def unset_auth_cookies(self, response):
        """
        Удаляет куки для аутентификации.
        """
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token') 