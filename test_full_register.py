import requests
import json
import uuid

BASE_URL = 'https://aiworkshop-production.up.railway.app'

def test_options_register():
    """Тестировать OPTIONS запрос к /api/register/ для проверки CORS"""
    url = f'{BASE_URL}/api/register/'
    headers = {
        'Origin': 'https://aiworkshop-1.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    print(f'\nTesting OPTIONS request to: {url}')
    try:
        response = requests.options(url, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers:')
        for key, value in response.headers.items():
            print(f'  {key}: {value}')
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print('✅ CORS настроен правильно!')
        else:
            print('❌ CORS НЕ настроен правильно! Нет заголовка Access-Control-Allow-Origin')
    except Exception as e:
        print(f'Error: {str(e)}')

def test_register():
    """Тестировать регистрацию пользователя"""
    url = f'{BASE_URL}/api/register/'
    
    # Генерируем уникальный email и username
    unique_id = str(uuid.uuid4())[:8]
    data = {
        'email': f'test{unique_id}@example.com',
        'username': f'testuser{unique_id}',
        'password': 'testpassword123',
        'password2': 'testpassword123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://aiworkshop-1.onrender.com'
    }
    
    print(f'\nTesting registration endpoint: {url}')
    print(f'Registration data:')
    print(json.dumps(data, indent=2))
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers:')
        for key, value in response.headers.items():
            print(f'  {key}: {value}')
        print(f'Response Content:')
        try:
            json_response = response.json()
            print(json.dumps(json_response, indent=2))
            
            if response.status_code == 201:
                print('✅ Регистрация успешна!')
                # Сохраняем токен для будущих тестов
                token = json_response.get('token')
                refresh = json_response.get('refresh')
                print(f'Token: {token[:10]}...')
                print(f'Refresh: {refresh[:10]}...')
                return token, refresh, data
            else:
                print('❌ Ошибка регистрации')
        except:
            print(response.text)
    except Exception as e:
        print(f'Error: {str(e)}')
    
    return None, None, None

def test_login(email, password):
    """Тестировать вход пользователя"""
    url = f'{BASE_URL}/api/login/'
    data = {
        'email': email,
        'password': password
    }
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://aiworkshop-1.onrender.com'
    }
    
    print(f'\nTesting login endpoint: {url}')
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers:')
        for key, value in response.headers.items():
            print(f'  {key}: {value}')
        print(f'Response Content:')
        try:
            json_response = response.json()
            print(json.dumps(json_response, indent=2))
            
            if response.status_code == 200:
                print('✅ Вход успешен!')
                token = json_response.get('token')
                print(f'Token: {token[:10]}...')
                return token
            else:
                print('❌ Ошибка входа')
        except:
            print(response.text)
    except Exception as e:
        print(f'Error: {str(e)}')
    
    return None

if __name__ == '__main__':
    print('Testing Authentication endpoints...')
    
    # Тест OPTIONS запроса
    test_options_register()
    
    # Тест регистрации
    token, refresh, user_data = test_register()
    
    # Если регистрация успешна, тестируем вход
    if token and user_data:
        test_login(user_data['email'], user_data['password']) 