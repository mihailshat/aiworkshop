from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ArticleSerializer,
    TagSerializer,
    CommentSerializer,
    FavoriteArticleSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    PasswordChangeSerializer,
    AvatarUpdateSerializer
)
from .models import PasswordResetToken, Article, Tag, Comment, FavoriteArticle
from .authentication import CookieJWTAuthentication, JWTAuthentication
from django.http import JsonResponse
import json
import os
import base64
from django.core.files.storage import default_storage
import traceback

# Словарь соответствия символьных идентификаторов числовым
ARTICLE_SLUGS = {
    'deepl': 1,
    'palette': 2,
    'yandex-gpt': 3,
    'perceptron': 4,
    'chatgpt': 5,
    'gigachat': 6,
}

# Добавляем тестовый маршрут для проверки доступности API
@api_view(['GET', 'OPTIONS'])
def debug_view(request):
    """
    Тестовый маршрут для проверки работоспособности API
    """
    print(f"[DEBUG] debug_view вызван, метод={request.method}, user={request.user}")
    
    # Обработка OPTIONS запроса
    if request.method == 'OPTIONS':
        response = Response({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        response["Access-Control-Max-Age"] = "86400"
        return response
    
    # Проверяем существование статей в базе данных
    try:
        # Получаем имеющиеся статьи для отладки
        articles = Article.objects.all()[:10]
        article_count = Article.objects.count()
        article_data = [{"id": a.id, "title": a.title} for a in articles]
        
        # Пытаемся получить статьи по ID из словаря слагов
        for slug, article_id in ARTICLE_SLUGS.items():
            try:
                article = Article.objects.get(id=article_id)
                print(f"[DEBUG] Article with id={article_id}, slug={slug} exists: {article.title}")
            except Article.DoesNotExist:
                print(f"[DEBUG] Article with id={article_id}, slug={slug} DOES NOT EXIST")
        
        # Отладочные данные для маппинга слагов
        slug_mapping = [{"slug": slug, "id": article_id} for slug, article_id in ARTICLE_SLUGS.items()]
        
        response = Response({
            'status': 'ok',
            'message': 'API работает корректно',
            'authenticated': request.user and request.user.is_authenticated,
            'user': str(request.user) if request.user and request.user.is_authenticated else None,
            'method': request.method,
            'headers': {k: request.headers[k] for k in request.headers.keys()},
            'api_endpoints': [
                {'url': '/api/articles/{id}/add_to_favorites/', 'method': 'POST'},
                {'url': '/api/articles/{id}/remove_from_favorites/', 'method': 'POST'},
                {'url': '/api/articles/{id}/is_favorite/', 'method': 'GET'},
            ],
            'article_count': article_count,
            'articles': article_data,
            'slug_mapping': slug_mapping
        })
        
        # Добавляем CORS заголовки напрямую
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        
        return response
    except Exception as e:
        print(f"[DEBUG ERROR] Error in debug_view: {str(e)}")
        response = Response({
            'status': 'error',
            'message': str(e)
        })
        
        # Добавляем CORS заголовки напрямую
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        
        return response

# Специальные API для работы со slug вместо ID
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def add_to_favorites_by_slug(request, slug=None):
    """
    Добавление статьи в избранное по slug
    """
    print(f"[DEBUG] add_to_favorites_by_slug вызван с slug={slug}, user={request.user}, query params={request.query_params}, data={request.data}")
    print(f"[DEBUG] URL path: {request.path}")
    print(f"[DEBUG] Full URL: {request.build_absolute_uri()}")
    print(f"[DEBUG] Headers: {request.headers}")
    
    if slug is None:
        slug = request.data.get('slug', None) or request.query_params.get('slug')
        
    print(f"[DEBUG] Using slug={slug}")
    
    # Проверка аутентификации
    if not request.user.is_authenticated:
        print(f"[DEBUG ERROR] Пользователь не аутентифицирован")
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Конвертируем slug в ID
    article_id = ARTICLE_SLUGS.get(slug)
    if not article_id:
        print(f"[DEBUG ERROR] Slug не найден в словаре: {slug}")
        return Response({"detail": f"Статья со slug '{slug}' не найдена"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        print(f"[DEBUG] Ищем статью с ID={article_id}")
        article = Article.objects.filter(id=article_id).first()
        
        if not article:
            print(f"[DEBUG ERROR] Статья с ID={article_id} не найдена в базе данных")
            # Создаем статью автоматически для тестирования (опционально)
            print(f"[DEBUG] Создаем статью для тестирования с ID={article_id}")
            article = Article.objects.create(
                id=article_id,
                title=f"Статья {article_id}",
                content=f"Содержимое статьи {article_id}",
                description=f"Описание статьи {article_id}",
                author=request.user
            )
        
        favorite_exists = FavoriteArticle.objects.filter(user=request.user, article=article).exists()
        print(f"[DEBUG] Статья уже в избранном? {favorite_exists}")
        
        if not favorite_exists:
            FavoriteArticle.objects.create(user=request.user, article=article)
            print(f"[DEBUG] Статья добавлена в избранное")
            return Response({'status': 'added to favorites'})
        
        print(f"[DEBUG] Статья уже была в избранном")
        return Response({'status': 'already in favorites'})
    except Exception as e:
        print(f"[DEBUG ERROR] Ошибка при добавлении в избранное: {str(e)}")
        # Возвращаем более подробную информацию об ошибке для отладки
        import traceback
        return Response({
            "detail": str(e),
            "traceback": traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def remove_from_favorites_by_slug(request, slug=None):
    """
    Удаление статьи из избранного по slug
    """
    print(f"[DEBUG] remove_from_favorites_by_slug вызван с slug={slug}, user={request.user}")
    print(f"[DEBUG] URL path: {request.path}")
    print(f"[DEBUG] Full URL: {request.build_absolute_uri()}")
    print(f"[DEBUG] Headers: {request.headers}")
    
    if slug is None:
        slug = request.data.get('slug', None) or request.query_params.get('slug')
        
    print(f"[DEBUG] Using slug={slug}")
    
    # Проверка аутентификации
    if not request.user.is_authenticated:
        print(f"[DEBUG ERROR] Пользователь не аутентифицирован")
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Конвертируем slug в ID
    article_id = ARTICLE_SLUGS.get(slug)
    if not article_id:
        print(f"[DEBUG ERROR] remove_from_favorites_by_slug: Slug '{slug}' не найден в ARTICLE_SLUGS.")
        return Response({"detail": f"Статья со slug '{slug}' не найдена в словаре сопоставления."}, status=status.HTTP_404_NOT_FOUND)
    
    print(f"[DEBUG] remove_from_favorites_by_slug: Пытаемся найти статью с ID={article_id} (получено из slug '{slug}')")
    try:
        article = Article.objects.filter(id=article_id).first()
        
        if not article:
            print(f"[DEBUG ERROR] remove_from_favorites_by_slug: Статья с ID={article_id} (из slug '{slug}') НЕ НАЙДЕНА в базе данных.")
            return Response({"detail": f"Статья с ID {article_id} (из slug '{slug}') не найдена в базе данных."}, status=status.HTTP_404_NOT_FOUND)
            
        print(f"[DEBUG] remove_from_favorites_by_slug: Найдена статья: {article.title} (ID: {article.id})")
        favorite = FavoriteArticle.objects.filter(user=request.user, article=article)
        if favorite.exists():
            favorite.delete()
            print(f"[DEBUG] Статья удалена из избранного")
            return Response({'status': 'removed from favorites'})
        else:
            print(f"[DEBUG] Статья не была в избранном")
            return Response({'status': 'article was not in favorites'})
            
    except Exception as e:
        print(f"[DEBUG ERROR] Ошибка при удалении из избранного: {str(e)}")
        import traceback
        return Response({
            "detail": str(e),
            "traceback": traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def is_favorite_by_slug(request, slug=None):
    """
    Проверка статуса избранного по slug
    """
    print(f"[DEBUG] is_favorite_by_slug вызван с slug={slug}, user={request.user}")
    print(f"[DEBUG] URL path: {request.path}")
    print(f"[DEBUG] Full URL: {request.build_absolute_uri()}")
    print(f"[DEBUG] Headers: {request.headers}")
    
    if slug is None:
        slug = request.data.get('slug', None) or request.query_params.get('slug')
        
    print(f"[DEBUG] Using slug={slug}")
    
    # Проверка аутентификации
    if not request.user.is_authenticated:
        print(f"[DEBUG ERROR] Пользователь не аутентифицирован")
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Конвертируем slug в ID
    article_id = ARTICLE_SLUGS.get(slug)
    if not article_id:
        return Response({"detail": f"Статья со slug '{slug}' не найдена"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        article = Article.objects.filter(id=article_id).first()
        
        if not article:
            return Response({"detail": "Статья не найдена"}, status=status.HTTP_404_NOT_FOUND)
            
        is_favorite = FavoriteArticle.objects.filter(user=request.user, article=article).exists()
        return Response({'is_favorite': is_favorite})
    except Exception as e:
        print(f"[DEBUG ERROR] Ошибка при проверке статуса избранного: {str(e)}")
        import traceback
        return Response({
            "detail": str(e),
            "traceback": traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_avatar(self, request):
        serializer = AvatarUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
            return Response({
                'avatar': avatar_url,
                'avatar_url': avatar_url  # Добавляем дублирующее поле для совместимости
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Wrong password.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                validate_password(serializer.validated_data['new_password'], user)
            except ValidationError as e:
                return Response({'new_password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'password changed'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def add_to_favorites(self, request, pk=None):
        print(f"[DEBUG] add_to_favorites вызван с pk={pk}, user={request.user}")
        article = self.get_object()
        if not FavoriteArticle.objects.filter(user=request.user, article=article).exists():
            FavoriteArticle.objects.create(user=request.user, article=article)
            return Response({'status': 'added to favorites'})
        return Response({'status': 'already in favorites'})

    @action(detail=True, methods=['post'])
    def remove_from_favorites(self, request, pk=None):
        print(f"[DEBUG] remove_from_favorites вызван с pk={pk}, user={request.user}")
        article = self.get_object()
        FavoriteArticle.objects.filter(user=request.user, article=article).delete()
        return Response({'status': 'removed from favorites'})

    @action(detail=True, methods=['get'])
    def is_favorite(self, request, pk=None):
        print(f"[DEBUG] is_favorite вызван с pk={pk}, user={request.user}")
        article = self.get_object()
        is_favorite = FavoriteArticle.objects.filter(user=request.user, article=article).exists()
        return Response({'is_favorite': is_favorite})

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        article_id = self.kwargs.get('article_pk')
        if article_id:
            return Comment.objects.filter(article_id=article_id)
        return Comment.objects.none()

class FavoriteArticleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FavoriteArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return FavoriteArticle.objects.filter(user=self.request.user)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS request"""
        print("[DEBUG] RegisterView: Handling OPTIONS request")
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    def post(self, request):
        print("Received registration data:", request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            print("Serializer is valid")
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
            # Добавляем CORS заголовки напрямую для уверенности
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
            response["Access-Control-Allow-Credentials"] = "true"
            
            return response
            
        print("Serializer errors:", serializer.errors)
        # Возвращаем детальные ошибки для отладки
        response = Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # Добавляем CORS заголовки напрямую для уверенности
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS request"""
        print("[DEBUG] LoginView: Handling OPTIONS request")
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(email=serializer.validated_data['email'])
            if user.check_password(serializer.validated_data['password']):
                refresh = RefreshToken.for_user(user)
                response = Response({
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
                
                # Добавляем CORS заголовки напрямую для уверенности
                response["Access-Control-Allow-Origin"] = "*"
                response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
                response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
                response["Access-Control-Allow-Credentials"] = "true"
                
                return response
                
            response = Response(
                {'password': ['Invalid password']},
                status=status.HTTP_400_BAD_REQUEST
            )
            
            # Добавляем CORS заголовки напрямую для уверенности
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
            response["Access-Control-Allow-Credentials"] = "true"
            
            return response
            
        response = Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Добавляем CORS заголовки напрямую для уверенности
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response

class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (CookieJWTAuthentication,)

    def post(self, request):
        response = Response({"detail": "Успешный выход из системы"})
        auth = CookieJWTAuthentication()
        auth.unset_auth_cookies(response)
        return response

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (CookieJWTAuthentication,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# Заменяем класс ForgotPasswordView на более простую реализацию
def forgot_password_view(request):
    """
    Простое представление для запроса сброса пароля без DRF permissions.
    """
    print(f"[forgot_password_view] Method: {request.method}")
    print(f"[forgot_password_view] Headers: {request.headers}")
    
    # Обработка CORS
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    if request.method != 'POST':
        return JsonResponse({'detail': 'Метод не поддерживается'}, status=405)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        print(f"[forgot_password_view] Received data: {data}")
        
        if not email:
            response = JsonResponse({'detail': 'Не указан email'}, status=400)
            response['Access-Control-Allow-Origin'] = '*'
            return response
        
        try:
            user = User.objects.get(email=email)
            print(f"[forgot_password_view] User found: {user.email}")
            
            # Создаем токен для сброса пароля
            reset_token = PasswordResetToken.objects.create(user=user)
            print(f"[forgot_password_view] Created reset token: {reset_token.token}")
            
            # Отправляем email с ссылкой для сброса пароля
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
            print(f"[forgot_password_view] Reset URL: {reset_url}")
            print(f"[forgot_password_view] Email settings:")
            print(f"  - EMAIL_HOST: {settings.EMAIL_HOST}")
            print(f"  - EMAIL_PORT: {settings.EMAIL_PORT}")
            print(f"  - EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}")
            print(f"  - EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
            print(f"  - EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
            print(f"  - DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
            
            try:
                print(f"[forgot_password_view] Attempting to send email to {email}")
                
                # Создаем SMTP соединение напрямую
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart
                
                print(f"[forgot_password_view] Creating SMTP connection to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
                
                # Создаем сообщение
                msg = MIMEMultipart()
                msg['From'] = settings.EMAIL_HOST_USER
                msg['To'] = email
                msg['Subject'] = 'Сброс пароля'
                
                body = f'Для сброса пароля перейдите по ссылке: {reset_url}'
                msg.attach(MIMEText(body, 'plain'))
                
                try:
                    # Создаем SMTP соединение
                    server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
                    print(f"[forgot_password_view] SMTP connection created")
                    
                    # Логинимся
                    print(f"[forgot_password_view] Attempting to login with {settings.EMAIL_HOST_USER}")
                    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                    print(f"[forgot_password_view] Login successful")
                    
                    # Отправляем письмо
                    print(f"[forgot_password_view] Sending email...")
                    server.send_message(msg)
                    print(f"[forgot_password_view] Email sent successfully")
                    
                    # Закрываем соединение
                    server.quit()
                    print(f"[forgot_password_view] SMTP connection closed")
                    
                except smtplib.SMTPAuthenticationError as auth_error:
                    print(f"[forgot_password_view] SMTP Authentication Error: {str(auth_error)}")
                    print(f"[forgot_password_view] Please check your email credentials")
                except smtplib.SMTPException as smtp_error:
                    print(f"[forgot_password_view] SMTP Error: {str(smtp_error)}")
                except Exception as e:
                    print(f"[forgot_password_view] Unexpected error during SMTP: {str(e)}")
                    import traceback
                    print(f"[forgot_password_view] Traceback: {traceback.format_exc()}")
                
            except Exception as e:
                print(f"[forgot_password_view] Error sending email: {str(e)}")
                print(f"[forgot_password_view] Error type: {type(e)}")
                import traceback
                print(f"[forgot_password_view] Traceback: {traceback.format_exc()}")
        except User.DoesNotExist:
            print(f"[forgot_password_view] User not found: {email}")
        
        # Всегда возвращаем одно и то же сообщение для безопасности
        response = JsonResponse({
            'detail': 'Если указанный email зарегистрирован, вы получите инструкции по сбросу пароля'
        }, status=200)
        
        # Добавляем CORS заголовки к ответу
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
    
    except json.JSONDecodeError:
        response = JsonResponse({'detail': 'Неверный формат данных'}, status=400)
        response['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        print(f"[forgot_password_view] Unexpected error: {str(e)}")
        import traceback
        print(f"[forgot_password_view] Traceback: {traceback.format_exc()}")
        response = JsonResponse({'detail': 'Произошла ошибка при обработке запроса'}, status=500)
        response['Access-Control-Allow-Origin'] = '*'
        return response

# Оставляем оригинальный класс, но переименовываем его для сохранения совместимости
class ForgotPasswordViewOld(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        print(f"[ForgotPasswordViewOld] Headers: {request.headers}")
        print(f"[ForgotPasswordViewOld] Data: {request.data}")
        print(f"[ForgotPasswordViewOld] Auth: {request.auth}")
        print(f"[ForgotPasswordViewOld] User: {request.user}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            print(f"[ForgotPasswordViewOld] User found: {user.email}")
        except User.DoesNotExist:
            print(f"[ForgotPasswordViewOld] User not found for email: {email}")
            return Response(
                {"detail": "Если указанный email зарегистрирован, вы получите инструкции по сбросу пароля"},
                status=status.HTTP_200_OK
            )
        
        # Создаем токен для сброса пароля
        reset_token = PasswordResetToken.objects.create(user=user)
        print(f"[ForgotPasswordViewOld] Created reset token: {reset_token.token}")
        
        # Отправляем email с ссылкой для сброса пароля
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
        try:
            send_mail(
                'Сброс пароля',
                f'Для сброса пароля перейдите по ссылке: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            print(f"[ForgotPasswordViewOld] Reset email sent to: {email}")
        except Exception as e:
            print(f"[ForgotPasswordViewOld] Error sending email: {str(e)}")
            # Даже если отправка не удалась, возвращаем успешный ответ
            # чтобы не раскрывать информацию о существовании пользователя
        
        return Response(
            {"detail": "Если указанный email зарегистрирован, вы получите инструкции по сбросу пароля"},
            status=status.HTTP_200_OK
        )

class ResetPasswordView(generics.GenericAPIView):
    """
    API для сброса пароля.
    Этот эндпоинт не требует аутентификации.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Отключаем аутентификацию
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        # Выводим информацию о запросе для отладки
        print(f"[ResetPasswordView] Received request: {request.data}")
        print(f"[ResetPasswordView] Headers: {request.headers}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        user = reset_token.user
        
        # Устанавливаем новый пароль
        user.set_password(serializer.validated_data['password'])
        user.save()
        
        # Помечаем токен как использованный
        reset_token.is_used = True
        reset_token.save()
        
        # Выводим информацию об успешном сбросе пароля
        print(f"[ResetPasswordView] Successfully reset password for user {user.email}")
        
        return Response(
            {"detail": "Пароль успешно изменен"},
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def convert_avatars_api(request):
    """
    API для ручной конвертации аватарок в base64 формат
    """
    try:
        print("[convert_avatars_api] Starting conversion...")
        users_with_avatar = User.objects.exclude(avatar='')
        converted_count = 0
        
        for user in users_with_avatar:
            if user.avatar and hasattr(user.avatar, 'name') and user.avatar.name:
                try:
                    # Получаем путь к файлу
                    file_path = user.avatar.name
                    print(f"[convert_avatars_api] Processing avatar for user {user.email}: {file_path}")
                    
                    # Проверяем существование файла
                    if default_storage.exists(file_path):
                        print(f"[convert_avatars_api] File exists")
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
                        
                        print(f"[convert_avatars_api] Content type: {content_type}")
                        
                        # Читаем файл и кодируем в base64
                        with default_storage.open(file_path, 'rb') as f:
                            file_content = f.read()
                            base64_data = base64.b64encode(file_content).decode('utf-8')
                            
                            # Сохраняем в новых полях
                            user.avatar_base64 = base64_data
                            user.avatar_content_type = content_type
                            user.save(update_fields=['avatar_base64', 'avatar_content_type'])
                            print(f"[convert_avatars_api] Avatar successfully converted to base64")
                            converted_count += 1
                    else:
                        print(f"[convert_avatars_api] File does not exist")
                except Exception as e:
                    print(f"[convert_avatars_api] Error converting avatar: {str(e)}")
                    print(traceback.format_exc())
        
        return Response({
            'status': 'success',
            'detail': f'Converted {converted_count} avatars to base64 format',
            'converted_count': converted_count,
            'total_avatars': users_with_avatar.count()
        })
    except Exception as e:
        print(f"[convert_avatars_api] Unexpected error: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
