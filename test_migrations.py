import requests
import time
import sys

def run_migrations(base_url):
    """Функция для запуска миграций через специальный эндпоинт"""
    print(f"Запуск миграций для {base_url}...")
    
    url = f"{base_url}/api/run-migrations/"
    try:
        response = requests.get(url)
        print(f"Статус: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Миграции успешно применены")
            return True
        else:
            print("❌ Ошибка при выполнении миграций")
            return False
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        return False

if __name__ == "__main__":
    # Если передан аргумент, используем его как базовый URL, иначе - дефолтный
    base_url = sys.argv[1] if len(sys.argv) > 1 else "https://aiworkshop-production.up.railway.app"
    print(f"Использую базовый URL: {base_url}")
    
    success = run_migrations(base_url)
    
    if success:
        print("\n== Проверка подключения к БД через /api/register/ через 5 секунд ==")
        print("Ждем применения миграций...")
        time.sleep(5)  # Даем время на применение миграций
        
        # Проверяем, что теперь эндпоинт работает
        url = f"{base_url}/api/register/"
        try:
            response = requests.options(url)
            print(f"OPTIONS Статус: {response.status_code}")
            
            # Теперь пробуем GET-запрос для проверки ошибки
            response = requests.get(url)
            print(f"GET Статус: {response.status_code}")
            
            if response.status_code not in [404, 500]:
                print("✅ Сервер отвечает, база данных работает")
            else:
                print("❌ Сервер отвечает с ошибкой:", response.text[:100])
        except Exception as e:
            print(f"❌ Ошибка при проверке эндпоинта: {str(e)}")
    
    print("\nЗапустите полное тестирование после применения миграций:")
    print("python test_system.py") 