import os
import django
import base64
from django.core.files.storage import default_storage
import os

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Импортируем модель User
from django.contrib.auth import get_user_model
User = get_user_model()

def convert_avatars_to_base64():
    """
    Конвертирует существующие файлы аватарок в base64 и сохраняет их в поле avatar_base64
    """
    print("Начинаем конвертацию аватарок в base64...")
    users_with_avatar = User.objects.exclude(avatar='')
    print(f"Найдено {users_with_avatar.count()} пользователей с аватарками")
    
    for user in users_with_avatar:
        if user.avatar and hasattr(user.avatar, 'name') and user.avatar.name:
            try:
                # Получаем путь к файлу
                file_path = user.avatar.name
                print(f"Обрабатываем аватарку для пользователя {user.email}: {file_path}")
                
                # Проверяем существование файла
                if default_storage.exists(file_path):
                    print(f"  Файл существует")
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
                    
                    print(f"  Тип контента: {content_type}")
                    
                    # Читаем файл и кодируем в base64
                    with default_storage.open(file_path, 'rb') as f:
                        file_content = f.read()
                        base64_data = base64.b64encode(file_content).decode('utf-8')
                        
                        # Сохраняем в новых полях
                        user.avatar_base64 = base64_data
                        user.avatar_content_type = content_type
                        user.save(update_fields=['avatar_base64', 'avatar_content_type'])
                        print(f"  Аватарка успешно конвертирована в base64")
                else:
                    print(f"  Файл не существует")
            except Exception as e:
                print(f"  Ошибка при конвертации аватарки: {str(e)}")

def test_avatars():
    """
    Тестирует наличие аватарок в base64 формате
    """
    print("\nПроверяем наличие аватарок в base64 формате...")
    users = User.objects.all()
    
    for user in users:
        print(f"Пользователь {user.email}:")
        print(f"  Аватарка (файл): {'Есть' if user.avatar else 'Нет'}")
        print(f"  Аватарка (base64): {'Есть' if user.avatar_base64 else 'Нет'}")
        if user.avatar_base64:
            print(f"  Тип контента: {user.avatar_content_type}")
            print(f"  Длина base64: {len(user.avatar_base64)} символов")

if __name__ == "__main__":
    print("=== Тестирование функционала хранения аватарок в base64 ===")
    convert_avatars_to_base64()
    test_avatars()
    print("=== Тестирование завершено ===") 