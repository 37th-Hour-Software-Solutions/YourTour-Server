# This file is used to test the API endpoints

import requests
import random
import string

BASE_URL = 'http://ec2-18-222-210-86.us-east-2.compute.amazonaws.com:3000'
    
def test_login(email, password):
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'email': email,        
        'password': password
    })
    accessToken = response.json()['data']['accessToken']
    refreshToken = response.json()['data']['refreshToken']
    print(response.json())
    return accessToken, refreshToken

def test_generate(accessToken, tripId, city, state):
    response = requests.get(f'{BASE_URL}/generate/trip/{tripId}/city/{city}/{state}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())

def test_geocode(accessToken, address):
    response = requests.get(f'{BASE_URL}/navigation/geocode/{address}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['latitude'], response.json()['data']['longitude']

def test_turnbyturn(accessToken, startCords, endCords):
    response = requests.get(f'{BASE_URL}/navigation/directions/{startCords}/{endCords}', headers={
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['tripId']

def test_poi(accessToken, lat, lon):
    response = requests.get(f'{BASE_URL}/navigation/geocode/reverse/poi/{lat}/{lon}', headers= {
        'Authorization': f'{accessToken}'
    })
    print(response.json())
    return response.json()['data']['city'], response.json()['data']['state']

# Simulate creating a user and logging in to get an access token
accessToken, refreshToken = test_login("admin@example.com", "admin")

trips = [
    {
        "start": "Nashville, Tennessee",
        "end": "Chattanooga, Tennessee",
        "stops": ["Nashville, Tennessee", "Smyrna, Tennessee", "Murfreesboro, Tennessee", "Manchester, Tennessee", "Monteagle, Tennessee", "Kimball, Tennessee", "Jasper, Tennessee", "Signal Mountain, Tennessee", "Red Bank, Tennessee", "Chattanooga, Tennessee"]
    },
    {
        "start": "Dallas, Texas",
        "end": "Austin, Texas",
        "stops": ["Dallas, Texas", "Duncanville, Texas", "Waxahachie, Texas", "Hillsboro, Texas", "Waco, Texas", "Hewitt, Texas", "Temple, Texas", "Georgetown, Texas", "Round Rock, Texas", "Austin, Texas"]
    },
    {
        "start": "Denver, Colorado",
        "end": "Colorado Springs, Colorado",
        "stops": ["Denver, Colorado", "Centennial, Colorado", "Castle Rock, Colorado", "Larkspur, Colorado", "Palmer Lake, Colorado", "Monument, Colorado", "Black Forest, Colorado", "Manitou Springs, Colorado", "Old Colorado City, Colorado", "Colorado Springs, Colorado"]
    },
    {
        "start": "Seattle, Washington",
        "end": "Portland, Oregon",
        "stops": ["Seattle, Washington", "Tukwila, Washington", "Federal Way, Washington", "Tacoma, Washington", "Olympia, Washington", "Centralia, Washington", "Longview, Washington", "Woodland, Washington", "Vancouver, Washington", "Portland, Oregon"]
    },
    {
        "start": "Atlanta, Georgia",
        "end": "Augusta, Georgia",
        "stops": ["Atlanta, Georgia", "Decatur, Georgia", "Conyers, Georgia", "Covington, Georgia", "Madison, Georgia", "Greensboro, Georgia", "Thomson, Georgia", "Harlem, Georgia", "Grovetown, Georgia", "Augusta, Georgia"]
    },
    {
        "start": "Chicago, Illinois",
        "end": "Milwaukee, Wisconsin",
        "stops": ["Chicago, Illinois", "Oak Brook, Illinois", "Schaumburg, Illinois", "Crystal Lake, Illinois", "Woodstock, Illinois", "Lake Geneva, Wisconsin", "Elkhorn, Wisconsin", "East Troy, Wisconsin", "Waukesha, Wisconsin", "Milwaukee, Wisconsin"]
    },
    {
        "start": "Phoenix, Arizona",
        "end": "Tucson, Arizona",
        "stops": ["Phoenix, Arizona", "Chandler, Arizona", "Casa Grande, Arizona", "Picacho, Arizona", "Red Rock, Arizona", "Marana, Arizona", "Cortaro, Arizona", "Oro Valley, Arizona", "Catalina Foothills, Arizona", "Tucson, Arizona"]
    },
    {
        "start": "Charlotte, North Carolina",
        "end": "Asheville, North Carolina",
        "stops": ["Charlotte, North Carolina", "Gastonia, North Carolina", "Kings Mountain, North Carolina", "Shelby, North Carolina", "Rutherfordton, North Carolina", "Marion, North Carolina", "Old Fort, North Carolina", "Black Mountain, North Carolina", "Swannanoa, North Carolina", "Asheville, North Carolina"]
    },
    {
        "start": "New Orleans, Louisiana",
        "end": "Baton Rouge, Louisiana",
        "stops": ["New Orleans, Louisiana", "Kenner, Louisiana", "Laplace, Louisiana", "Gramercy, Louisiana", "Gonzales, Louisiana", "Prairieville, Louisiana", "Shenandoah, Louisiana", "Inniswold, Louisiana", "Westminster, Louisiana", "Baton Rouge, Louisiana"]
    }
]

for trip in trips:
    starting_lat, starting_long = test_geocode(accessToken, trip['start'])
    ending_lat, ending_long = test_geocode(accessToken, trip['end'])
    tripId = test_turnbyturn(accessToken, f"{starting_lat},{starting_long}", f"{ending_lat},{ending_long}")
    for stop in trip['stops']:
        test_generate(accessToken, tripId, stop.split(',')[0], stop.split(',')[1])

