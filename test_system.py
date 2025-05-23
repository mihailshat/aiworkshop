import requests
import json
import uuid
import time

BASE_URL = 'https://aiworkshop-production.up.railway.app'
FRONTEND_URL = 'https://aiworkshop-1.onrender.com'

class APITester:
    def __init__(self, base_url, frontend_url):
        self.base_url = base_url
        self.frontend_url = frontend_url
        self.access_token = None
        self.user_data = None
    
    def test_debug_endpoint(self):
        """Проверка работоспособности API через debug-эндпоинт"""
        print("\n===== ТЕСТ ОТЛАДОЧНОГО ЭНДПОИНТА =====")
        url = f'{self.base_url}/api/debug/'
        
        try:
            response = requests.get(url)
            print(f'Статус: {response.status_code}')
            
            if response.status_code == 200:
                data = response.json()
                print(f'Ответ API: Статус API = {data.get("status", "не указан")}')
                print(f'Сообщение: {data.get("message", "нет сообщения")}')
                print('✅ Отладочный эндпоинт работает')
                return True
            else:
                print(f'❌ Ошибка: {response.text[:200]}')
                return False
        except Exception as e:
            print(f'❌ Исключение: {str(e)}')
            return False
    
    def test_cors_settings(self):
        """Проверка настроек CORS через OPTIONS-запрос"""
        print("\n===== ТЕСТ CORS НАСТРОЕК =====")
        url = f'{self.base_url}/api/register/'
        headers = {
            'Origin': self.frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        try:
            response = requests.options(url, headers=headers)
            print(f'Статус: {response.status_code}')
            print(f'Заголовки ответа:')
            cors_headers = {}
            for key, value in response.headers.items():
                if key.startswith('Access-Control-'):
                    cors_headers[key] = value
                    print(f'  {key}: {value}')
            
            if 'Access-Control-Allow-Origin' in cors_headers:
                print('✅ CORS настроен правильно')
                return True
            else:
                print('❌ CORS НЕ настроен правильно: отсутствует заголовок Access-Control-Allow-Origin')
                return False
        except Exception as e:
            print(f'❌ Исключение: {str(e)}')
            return False
    
    def test_database_connection(self):
        """Проверка соединения с базой данных через регистрацию"""
        print("\n===== ТЕСТ СОЕДИНЕНИЯ С БД =====")
        
        # Просто попробуем отправить запрос к API, который требует доступа к БД
        url = f'{self.base_url}/api/register/'
        
        # Генерируем уникальные данные для теста
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
            'Origin': self.frontend_url
        }
        
        print(f'Отправка тестовых данных для регистрации: {json.dumps(data, indent=2)}')
        
        try:
            response = requests.post(url, json=data, headers=headers)
            print(f'Статус: {response.status_code}')
            
            # Пытаемся получить JSON, если это не JSON, будет исключение
            try:
                response_data = response.json()
                print(f'Ответ API: {json.dumps(response_data, indent=2)[:500]}')
                
                # Если статус 201, значит, соединение с БД установлено
                if response.status_code == 201:
                    print('✅ Соединение с БД работает')
                    self.access_token = response_data.get('token')
                    self.user_data = data
                    return True
                elif response.status_code == 400:
                    # Может быть валидационная ошибка, но база данных работает
                    print('✅ Соединение с БД, вероятно, работает (получены ошибки валидации)')
                    return True
                else:
                    print('❌ Ошибка при регистрации, статус:', response.status_code)
                    return False
            except json.JSONDecodeError:
                # Если не удалось декодировать JSON, это может быть ошибка в соединении с БД
                print(f'❌ Ошибка декодирования JSON: {response.text[:200]}')
                return False
        except Exception as e:
            print(f'❌ Исключение: {str(e)}')
            return False
    
    def test_login(self):
        """Проверка входа в систему с тестовым пользователем"""
        if not self.user_data:
            print("\n===== ТЕСТ ВХОДА ПРОПУЩЕН =====")
            print("Пользователь не был создан, невозможно проверить вход")
            return False
            
        print("\n===== ТЕСТ ВХОДА В СИСТЕМУ =====")
        url = f'{self.base_url}/api/login/'
        
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': self.frontend_url
        }
        
        print(f'Попытка входа с учетными данными: {json.dumps(data, indent=2)}')
        
        try:
            response = requests.post(url, json=data, headers=headers)
            print(f'Статус: {response.status_code}')
            
            try:
                response_data = response.json()
                print(f'Ответ API: {json.dumps(response_data, indent=2)[:500]}')
                
                if response.status_code == 200 and 'token' in response_data:
                    print('✅ Вход работает')
                    return True
                else:
                    print('❌ Ошибка входа')
                    return False
            except json.JSONDecodeError:
                print(f'❌ Ошибка декодирования JSON: {response.text[:200]}')
                return False
        except Exception as e:
            print(f'❌ Исключение: {str(e)}')
            return False

    def run_all_tests(self):
        """Запуск всех тестов последовательно"""
        print(f"===== НАЧАЛО ПОЛНОГО ТЕСТИРОВАНИЯ СИСТЕМЫ =====")
        print(f"Тестирование API: {self.base_url}")
        print(f"Фронтенд: {self.frontend_url}")
        print(f"Дата и время: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        test_results = {
            "debug_endpoint": self.test_debug_endpoint(),
            "cors_settings": self.test_cors_settings(),
            "database_connection": self.test_database_connection(),
        }
        
        # Тест входа выполняем только если соединение с БД работает 
        # и пользователь был создан
        if test_results["database_connection"] and self.user_data:
            test_results["login"] = self.test_login()
        
        print("\n===== ИТОГИ ТЕСТИРОВАНИЯ =====")
        for test_name, result in test_results.items():
            status = "✅ УСПЕХ" if result else "❌ НЕУДАЧА"
            print(f"{test_name}: {status}")
        
        all_success = all(test_results.values())
        print("\n===== ОБЩИЙ РЕЗУЛЬТАТ =====")
        if all_success:
            print("✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО")
        else:
            print("❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ")
        
        return all_success

if __name__ == "__main__":
    tester = APITester(BASE_URL, FRONTEND_URL)
    tester.run_all_tests() 