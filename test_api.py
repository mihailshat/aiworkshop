import requests
import json

BASE_URL = 'https://aiworkshop-production.up.railway.app'

def test_register():
    url = f'{BASE_URL}/api/register/'
    data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'testpassword123',
        'password2': 'testpassword123',
        'first_name': '',
        'last_name': ''
    }
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://aiworkshop-1.onrender.com'
    }
    
    print(f'\nTesting registration endpoint: {url}')
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers: {dict(response.headers)}')
        print(f'Response: {response.text}')
    except Exception as e:
        print(f'Error: {str(e)}')

def test_login():
    url = f'{BASE_URL}/api/login/'
    data = {
        'email': 'test@example.com',
        'password': 'testpassword123'
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
        print(f'Response Headers: {dict(response.headers)}')
        print(f'Response: {response.text}')
    except Exception as e:
        print(f'Error: {str(e)}')

if __name__ == '__main__':
    print('Testing API endpoints...')
    test_register()
    test_login() 