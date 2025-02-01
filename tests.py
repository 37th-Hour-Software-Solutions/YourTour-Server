# This file is used to test the API endpoints

import requests
import random
import string

def generate_random_email():
    return f'{random.randint(1000000000, 9999999999)}@gmail.com'

def generate_random_username():
    return f'{random.randint(1000000000, 9999999999)}'

def generate_random_password():
    upper = random.choice(string.ascii_uppercase) * 5
    lower = random.choice(string.ascii_lowercase) * 5
    number = random.choice(string.digits) * 5
    symbol = random.choice(string.punctuation) * 5
    return f'{upper}{lower}{number}{symbol}'

# Test the /auth/register endpoint
def test_register(email, username, password):
    response = requests.post('http://localhost:3000/auth/register', json={
        'email': email,
        'username': username,
        'password': password,
        'name': 'John Doe',
        'phone': '+19315815560'
    })
    print(response.json())
    
def test_login(email, username, password):
    response = requests.post('http://localhost:3000/auth/login', json={
        'email': email,
        'username': username,
        'password': password
    })
    accessToken = response.json()['data']['accessToken']
    refreshToken = response.json()['data']['refreshToken']
    print(response.json())
    return accessToken, refreshToken

def test_generate(accessToken, city, state):
    response = requests.get(f'http://localhost:3000/generate/{city}/{state}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())

email = generate_random_email()
username = generate_random_username()
password = generate_random_password()
test_register(email, username, password)
accessToken, refreshToken = test_login(email, username, password)
test_generate(accessToken, 'Syracuse', 'NY')