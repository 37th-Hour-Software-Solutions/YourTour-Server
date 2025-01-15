# API Documentation

All endpoints are located in the `routes` directory. Naming convention is `GET /example/` so the file is `example.js`. All endpoints should have proper Swagger documentation. 

## Design

The API should follow RESTful principles and expect and return consistent formats. For example, `GET` requests should expect query parameters and `POST` requests should expect a JSON body. All requests should be authenticated with a JWT token cookie ("token"). All responses should be in JSON format as follows:

```json
{
    "error": false,
    "data": {}
}
```

If an error occurs, the `error` field should be set to `true` and the `data` field should be the error message. Error message verbosity should depend on the `NODE_ENV` environment variable. In development, the error message should be verbose and include the stack trace. In production, the error message should be "Internal Server Error".

## Endpoints

### /auth (auth.js)

- `POST /auth/register`
```json
{
    "email": "test@test.com",
    "password": "password",
    "name": "John Doe",
    "phone": "1234567890"
}

{
    "error": false,
    "data": {
        "token": "1234567890"
    }
}
```

- `POST /auth/login`
```json
{
    "email": "test@test.com",
    "password": "password"
}

{
    "error": false,
    "data": {
        "token": "1234567890"
    }
}
```

### /navigation (navigation.js)

- `GET /navigation/geocode/:query`

```
Query: "100 Main St, Nashville, TN"

{
    "error": false,
    "data": {
        "latitude": 36.1627,
        "longitude": -86.7816
    }
}
```

- `GET /navigation/directions/:origin/:destination`

```
Origin: "36.1627,-86.7816"
Destination: "36.1627,-86.7816"

{
    "error": false,
    "data": {
        "instructions": [],
        "distance": 100,
        "duration": 100
    }
}
```

### /generate (generate.js)

- `GET /generate/:city/:state`

```
City: "Nashville"
State: "Tennessee"

{
    "error": false,
    "data": {
        "city": "Nashville",
        "state": "Tennessee",
        "facts": []
    }
}
```