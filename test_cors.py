import requests

def test_cors_preflight(url):
    headers = {
        'Origin': 'https://aiworkshop-1.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    print(f'\nTesting CORS preflight request to: {url}')
    try:
        response = requests.options(url, headers=headers)
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers:')
        for key, value in response.headers.items():
            print(f'  {key}: {value}')
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f'\nCORS is properly configured!')
        else:
            print(f'\nCORS is NOT properly configured!')
            print(f'Missing Access-Control-Allow-Origin header')
            
    except Exception as e:
        print(f'Error: {str(e)}')

if __name__ == '__main__':
    urls = [
        'https://aiworkshop-production.up.railway.app/api/register/',
        'https://aiworkshop-production.up.railway.app/api/debug/',
        'https://aiworkshop-production.up.railway.app/api/',
        'https://aiworkshop-production.up.railway.app/'
    ]
    
    for url in urls:
        test_cors_preflight(url) 