from django.http import JsonResponse
from django.conf import settings
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
from authentication.models import PasswordResetToken
import json

# Получаем модель User из настроек приложения
User = apps.get_model(settings.AUTH_USER_MODEL)

@csrf_exempt
def forgot_password(request):
    """
    Самое простое представление для запроса сброса пароля без использования DRF.
    """
    print(f"[forgot_password] Method: {request.method}")
    print(f"[forgot_password] Headers: {request.headers}")
    
    # Обработка CORS для предполетного запроса
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    # Принимаем только POST запросы
    if request.method != 'POST':
        return JsonResponse({'detail': 'Метод не поддерживается'}, status=405)
    
    try:
        # Получаем данные из запроса
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        print(f"[forgot_password] Received data: {data}")
        
        if not email:
            return JsonResponse({'detail': 'Не указан email'}, status=400)
        
        try:
            # Проверяем существование пользователя
            user = User.objects.get(email=email)
            print(f"[forgot_password] User found: {user.email}")
            
            # Создаем токен для сброса пароля
            reset_token = PasswordResetToken.objects.create(user=user)
            print(f"[forgot_password] Created reset token: {reset_token.token}")
            
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
                print(f"[forgot_password] Reset email sent to: {email}")
            except Exception as e:
                print(f"[forgot_password] Error sending email: {str(e)}")
        except User.DoesNotExist:
            print(f"[forgot_password] User not found: {email}")
        
        # Всегда возвращаем одно и то же сообщение для безопасности
        response = JsonResponse({
            'detail': 'Если указанный email зарегистрирован, вы получите инструкции по сбросу пароля'
        }, status=200)
        
        # Добавляем CORS заголовки
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
    
    except json.JSONDecodeError:
        return JsonResponse({'detail': 'Неверный формат данных'}, status=400)
    except Exception as e:
        print(f"[forgot_password] Unexpected error: {str(e)}")
        return JsonResponse({'detail': 'Произошла ошибка при обработке запроса'}, status=500)

@csrf_exempt
def reset_password(request):
    """
    Представление для сброса пароля без использования DRF.
    """
    print(f"[reset_password] Method: {request.method}")
    print(f"[reset_password] Headers: {request.headers}")
    
    # Обработка CORS для предполетного запроса
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    # Принимаем только POST запросы
    if request.method != 'POST':
        return JsonResponse({'detail': 'Метод не поддерживается'}, status=405)
    
    try:
        # Получаем данные из запроса
        data = json.loads(request.body.decode('utf-8'))
        reset_token = data.get('reset_token')
        password = data.get('password')
        print(f"[reset_password] Received data for token: {reset_token}")
        
        if not reset_token or not password:
            return JsonResponse({'detail': 'Не указан токен или пароль'}, status=400)
        
        try:
            # Проверяем существование токена
            token_obj = PasswordResetToken.objects.get(token=reset_token, is_used=False)
            
            # Проверяем, не истек ли токен
            if token_obj.is_expired():
                print(f"[reset_password] Token expired: {reset_token}")
                return JsonResponse({'detail': 'Токен сброса пароля истек'}, status=400)
            
            user = token_obj.user
            print(f"[reset_password] User found for token: {user.email}")
            
            # Устанавливаем новый пароль
            user.set_password(password)
            user.save()
            
            # Помечаем токен как использованный
            token_obj.is_used = True
            token_obj.save()
            
            print(f"[reset_password] Password reset successful for user: {user.email}")
            
            # Возвращаем успешный ответ
            response = JsonResponse({
                'detail': 'Пароль успешно изменен'
            }, status=200)
            
            # Добавляем CORS заголовки
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
            
            return response
            
        except PasswordResetToken.DoesNotExist:
            print(f"[reset_password] Token not found or already used: {reset_token}")
            return JsonResponse({'detail': 'Недействительный токен сброса пароля'}, status=400)
    
    except json.JSONDecodeError:
        return JsonResponse({'detail': 'Неверный формат данных'}, status=400)
    except Exception as e:
        # Добавляем подробное логирование ошибки
        print(f"[reset_password] Unexpected error: {str(e)}")
        print(f"[reset_password] Error type: {type(e).__name__}")
        import traceback
        print(f"[reset_password] Traceback: {traceback.format_exc()}")
        return JsonResponse({'detail': 'Произошла ошибка при обработке запроса'}, status=500) 