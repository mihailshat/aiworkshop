from django.db import migrations, models
import base64
from django.core.files.storage import default_storage
import os

def convert_avatars_to_base64(apps, schema_editor):
    """
    Конвертирует существующие файлы аватарок в base64 и сохраняет их в поле avatar_base64
    """
    User = apps.get_model('authentication', 'User')
    for user in User.objects.all():
        if user.avatar and hasattr(user.avatar, 'name') and user.avatar.name:
            try:
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
                        
                        # Сохраняем в новых полях
                        user.avatar_base64 = base64_data
                        user.avatar_content_type = content_type
                        user.save(update_fields=['avatar_base64', 'avatar_content_type'])
            except Exception as e:
                print(f"Ошибка при конвертации аватарки для пользователя {user.email}: {str(e)}")


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_tag_user_avatar_article_comment_favoritearticle_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar_base64',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='avatar_content_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.RunPython(convert_avatars_to_base64, migrations.RunPython.noop),
    ] 