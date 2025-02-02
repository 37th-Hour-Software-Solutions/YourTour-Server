# This file is used to test the API endpoints

import requests
import random
import string
import time

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
        'phone': '+19315815560',
        'homestate': 'NY',
        'interests': ['history', 'food', 'sports']
    })
    print(response.json())
    
def test_login(email, password):
    response = requests.post('http://localhost:3000/auth/login', json={
        'email': email,
        'password': password
    })
    print(response)
    accessToken = response.json()['data']['accessToken']
    refreshToken = response.json()['data']['refreshToken']
    print(response.json())
    return accessToken, refreshToken

def test_generate(accessToken, tripId, city, state):
    response = requests.get(f'http://localhost:3000/generate/trip/{tripId}/city/{city}/{state}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    
def test_profile(accessToken):
    response = requests.get('http://localhost:3000/profile', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())


def test_profile_update(accessToken):
    response = requests.post('http://localhost:3000/profile/update', json={'homestate': 'BRUH'}, headers={
        'Authorization': f'{accessToken}',
        'Content-Type': 'application/json'
    })
    print(response.json())

def test_geocode(accessToken, address):
    response = requests.get(f'http://localhost:3000/navigation/geocode/{address}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['latitude'], response.json()['data']['longitude']

def test_turnbyturn(accessToken, startCords, endCords):
    response = requests.get(f'http://localhost:3000/navigation/directions/{startCords}/{endCords}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['tripId']

def test_history(accessToken, lat, lon):
    response = requests.get(f'http://localhost:3000/history/', headers= {
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()

def test_autocomplete(accessToken, coords, text):
    response = requests.get(f'http://localhost:3000/navigation/autocomplete/{coords}/{text}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())

def test_poi(accessToken, lat, lon):
    response = requests.get(f'http://localhost:3000/navigation/geocode/reverse/poi/{lat}/{lon}', headers= {
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['city'], response.json()['data']['state']

def test_spoof(accessToken, start, end):
    url = f'http://localhost:3000/spoof/{start}/{end}'
    headers = {
        'Authorization': f'{accessToken}'
    }
    
    with requests.get(url, headers=headers, stream=True) as response:
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data:'):
                        data = decoded_line.split('data: ')[1]
                        print(data)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

# Simulate creating a user and logging in to get an access token

# Grab user input or generate random credentials if none provided
email = input("Email: ")
if (email is None):
    email = generate_random_email()

username = input("Username: ")
if (username is None):
    username = generate_random_username()

password = input("Password: ")
if (password is None): 
    password = generate_random_password()


test_register(email, username, password)
accessToken, refreshToken = test_login(email, username, password)

# Test the profile endpoint
#test_profile(accessToken)

test_profile_update(accessToken)

# Test the geocode endpoint (Simulate user's current location and geocoding their destination)
#starting_lat, starting_long = test_geocode(accessToken, '1301 E Main St, Murfreesboro, TN 37132')
#ending_lat, ending_long = test_geocode(accessToken, '1000 N Dixie Ave, Cookeville, TN 38501')

# Test the turn-by-turn endpoint (Simulate generating a route (and thus, a new trip))
#tripId = test_turnbyturn(accessToken, f"{starting_lat},{starting_long}", f"{ending_lat},{ending_long}")
# Test generate POI (Simulate given coords, generate a city state combo)
#city, state = test_poi(accessToken,'36.005243','-85.975284')

# Test the generate facts endpoint (Given a tripId, city, and state, generate facts)
#test_generate(accessToken, tripId, city, state)

test_spoof(accessToken,'36.0067,-85.9678', '36.174465,-86.767960')

#test_history(accessToken)
#test_autocomplete(accessToken, '36.005243,-85.975284', 'Murf')
