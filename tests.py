# This file is used to test the API endpoints

import requests
import random
import string
import time

red = '\033[91m'
green = '\033[92m'
blue = '\033[94m'
reset = '\033[0m'

DEBUG = False

def print_test_result(response, test_name):
    if str(response.status_code)[0] == '2':
        print(f"{green}[TEST] {test_name} successful{reset}")
    else:
        print(f"{red}[TEST] {test_name} failed{reset}")
        
def print_debug(response):
    if DEBUG:
        print(response.json())

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
    
    print_test_result(response, 'Register')
    print_debug(response)
    
def test_login(email, password):
    response = requests.post('http://localhost:3000/auth/login', json={
        'email': email,
        'password': password
    })
    print_test_result(response, 'Login')
    print_debug(response)
    accessToken = response.json()['data']['accessToken']
    refreshToken = response.json()['data']['refreshToken']
    return accessToken, refreshToken

def test_generate(accessToken, tripId, city, state):
    response = requests.get(f'http://localhost:3000/generate/trip/{tripId}/city/{city}/{state}', headers={
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'Generate')
    print_debug(response)
    
def test_profile(accessToken):
    response = requests.get('http://localhost:3000/profile', headers={
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'Profile')
    print_debug(response)


def test_profile_update(accessToken):
    response = requests.post('http://localhost:3000/profile/update', json={'homestate': 'WV'}, headers={
        'Authorization': f'{accessToken}',
        'Content-Type': 'application/json'
    })
    print_test_result(response, 'Profile update')
    print_debug(response)

def test_geocode(accessToken, address):
    response = requests.get(f'http://localhost:3000/navigation/geocode/{address}', headers={
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'Geocode')
    print_debug(response)
    return response.json()['data']['latitude'], response.json()['data']['longitude']

def test_turnbyturn(accessToken, startCords, endCords):
    response = requests.get(f'http://localhost:3000/navigation/directions/{startCords}/{endCords}', headers={
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'Turn by turn')
    print_debug(response)
    return response.json()['data']['tripId']

def test_history(accessToken):
    response = requests.get(f'http://localhost:3000/history/', headers= {
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'History')
    print_debug(response)
    return response.json()

def test_autocomplete(accessToken, coords, text):
    response = requests.get(f'http://localhost:3000/navigation/autocomplete/{coords}/{text}', headers={
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'Autocomplete')
    print_debug(response)

def test_poi(accessToken, lat, lon):
    response = requests.get(f'http://localhost:3000/navigation/geocode/reverse/poi/{lat}/{lon}', headers= {
        'Authorization': f'{accessToken}'
    })
    print_test_result(response, 'POI')
    print_debug(response)
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
if (email == ""):
    email = generate_random_email()

username = input("Username: ")
if (username == ""):
    username = generate_random_username()

password = input("Password: ")
if (password == ""): 
    password = generate_random_password()

print(f"Email: {email}, Username: {username}, Password: {password}")

test_register(email, username, password)
accessToken, refreshToken = test_login(email, password)

test_profile_update(accessToken)

# Test the profile endpoint
test_profile(accessToken)

# Test the geocode endpoint (Simulate user's current location and geocoding their destination)
starting_lat, starting_long = test_geocode(accessToken, '1301 E Main St, Murfreesboro, TN 37132')
ending_lat, ending_long = test_geocode(accessToken, '1000 N Dixie Ave, Cookeville, TN 38501')

# Test the turn-by-turn endpoint (Simulate generating a route (and thus, a new trip))
tripId = test_turnbyturn(accessToken, f"{starting_lat},{starting_long}", f"{ending_lat},{ending_long}")

# Test generate POI (Simulate given coords, generate a city state combo)
city, state = test_poi(accessToken, '35.045631', '-85.309677')

# Test the generate facts endpoint (Given a tripId, city, and state, generate facts)
test_generate(accessToken, tripId, city, state)

# test_spoof(accessToken,'36.0067,-85.9678', '36.174465,-86.767960')

test_history(accessToken)
#test_autocomplete(accessToken, '36.005243,-85.975284', 'Murf')
