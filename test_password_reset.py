import requests
import json

# URL нашего эндпоинта
url = 'http://localhost:8000/api/forgot-password/'

# Данные для запроса
data = {
    'email': 'mihailshattt@gmail.com'
}

# Отправляем запрос
print(f"Отправка запроса на {url} с данными: {data}")

response = requests.post(
    url,
    json=data,
    headers={'Content-Type': 'application/json'},
    timeout=10
)

# Выводим результат
print(f"Статус ответа: {response.status_code}")
print(f"Заголовки ответа: {dict(response.headers)}")

try:
    print(f"Тело ответа: {json.loads(response.text)}")
except:
    print(f"Тело ответа (текст): {response.text}") 