from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import PasswordResetToken, Article, Tag, Comment, FavoriteArticle
import base64
from django.core.files.base import ContentFile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()  # Добавляем для обратной совместимости

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'avatar_url', 'avatar')
        read_only_fields = ('id',)

    def get_avatar_url(self, obj):
        # Сначала проверяем, есть ли base64 версия аватарки
        if obj.avatar_base64:
            # Возвращаем data URL с base64 данными
            return f"data:{obj.avatar_content_type};base64,{obj.avatar_base64}"
        
        # Если нет base64, проверяем наличие файла
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            else:
                # Если request недоступен, возвращаем относительный URL
                # Это может произойти в некоторых контекстах, например, в management commands
                return obj.avatar.url
        return None
        
    def get_avatar(self, obj):
        # То же самое, что и get_avatar_url для обратной совместимости
        return self.get_avatar_url(obj)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'text', 'author', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ('id', 'title', 'description', 'content', 'author', 'tags', 'comments', 'created_at', 'updated_at', 'is_favorite')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FavoriteArticle.objects.filter(user=request.user, article=obj).exists()
        return False

class FavoriteArticleSerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = FavoriteArticle
        fields = ('id', 'article', 'created_at')
        read_only_fields = ('id', 'created_at')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message='Введите корректный email адрес'
            )
        ]
    )
    username = serializers.CharField(
        required=True,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9_]{3,20}$',
                message='Имя пользователя должно содержать от 3 до 20 символов и может включать только буквы, цифры и знак подчеркивания'
            )
        ]
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return data

class AvatarUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('avatar',)

    def validate_avatar(self, value):
        if not value.startswith('data:image/'):
            raise serializers.ValidationError('Invalid image data')
        return value

    def save(self, **kwargs):
        user = self.instance
        avatar_data = self.validated_data['avatar']
        
        # Удаляем старую аватарку, если она есть
        if user.avatar:
            user.avatar.delete()
        
        # Преобразуем base64 в файл
        format, imgstr = avatar_data.split(';base64,')
        ext = format.split('/')[-1]
        file_name = f"avatar_{user.id}.{ext}"
        
        # Извлекаем content_type
        content_type = format.split(':')[1]
        
        # Сохраняем base64 данные прямо в поле модели
        user.avatar_base64 = imgstr
        user.avatar_content_type = content_type
        
        # Создаем файл из base64 данных
        data = ContentFile(base64.b64decode(imgstr), name=file_name)
        
        # Сохраняем файл (сохраняем для совместимости, хотя он может быть удален при деплое)
        user.avatar.save(file_name, data, save=False)
        
        # Сохраняем пользователя
        user.save()
        
        return user

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message='Введите корректный email адрес'
            )
        ]
    )
    username = serializers.CharField(
        required=True,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9_]{3,20}$',
                message='Имя пользователя должно содержать от 3 до 20 символов и может включать только буквы, цифры и знак подчеркивания'
            )
        ]
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message='Введите корректный email адрес'
            )
        ]
    )

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # Не выбрасываем ошибку, чтобы не раскрывать информацию о существовании пользователя
            pass
        return value

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=attrs['token'],
                is_used=False
            )
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Недействительный или использованный токен"})
        
        attrs['reset_token'] = reset_token
        return attrs 