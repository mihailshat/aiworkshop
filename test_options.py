import requests

def test_get_request():
    url = 'https://aiworkshop-production.up.railway.app/api/debug/'
    
    print(f'Testing GET request to: {url}')
    try:
        response = requests.get(url)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers:')
        for key, value in response.headers.items():
            print(f'  {key}: {value}')
        print(f'Response Content:')
        print(response.text[:500])  # Печатаем до 500 символов ответа
    except Exception as e:
        print(f'Error: {str(e)}')

if __name__ == '__main__':
    test_get_request() 