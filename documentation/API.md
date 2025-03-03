# API Documentation

All endpoints are located in the `routes` directory. Naming convention is `GET /example/` so the file is `example.js`. All endpoints should have proper Swagger documentation, including security headers, body parameters, response formats, etc. An example of a Swagger documentation block is provided below:

```
/**
 * @swagger
 * /generate/{city}/{state}:
 *   get:
 *     summary: Generate or retrieve facts about a city
 *     description: Returns facts about a specified city, either from cache or newly generated
 *     security:
 *       - bearerAuth: []
 *     tags: [Generate]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: The state of the city
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved city facts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
```

## Design

The API should follow RESTful principles and expect and return consistent formats. For example, `GET` requests should expect query parameters and `POST` requests should expect a JSON body. All requests should be authenticated with a JWT access token in the `Authorization` header using the `AuthenticateAccessToken` middleware from `middleware/auth.js`. All responses should be in JSON format as follows:

```json
{
    "error": false,
    "data": {}
}
```

If an error occurs, the `error` field should be set to `true` and the `data` field should contain a `message` field the error message. Error message verbosity should depend on the `NODE_ENV` environment variable. In development, the error message should be verbose and include the stack trace. In production, the error message should be "Internal Server Error".

## Field Validation

All fields should be validated using `express-validator`. Specifically, schemas should be created in the `schemas` directory and routes should use the `validateFields` middleware from `middleware/validate.js`. An example of a schema is provided below:

```js
const loginSchema = {
    email: {
        isEmail: true,
		optional: false,
    },
    password: {
		optional: false,
    }
};

module.exports = { loginSchema };
```

Then, the route should use the `validateFields` middleware to validate the request body:

```js
router.post('/login', validateFields(loginSchema), async (req, res) => {
    // Handle request
});
```

## Endpoints

### /auth (auth.js)

- `POST /auth/register` (No authentication required)
```json
{
    "email": "test@test.com",
    "username": "test",
    "password": "password",
    "name": "John Doe",
    "phone": "+11234567890",
    "homestate": "NY",
    "interests": ["travel", "food", "history"]
}

{
    "error": false,
    "data": {
        "message": "User registered successfully"   
    }
}
```

- `POST /auth/login` (No authentication required)
```json
{
    "email": "test@test.com",
    "password": "password"
}

{
    "error": false,
    "data": {
        "accessToken": "1234567890",
        "refreshToken": "1234567890"
    }
}
```

- `POST /auth/refresh` (No authentication required)
```json
{
    "refreshToken": "1234567890"
}

{
    "error": false,
    "data": {
        "accessToken": "1234567890"
    }
}
```



### /profile (profile.js)

- `GET /profile` (Authenticated)
```json
{
    "error": false,
    "data": {
        "id": "1234567890",
        "username": "test",
        "name": "John Doe",
        "phone": "+11234567890",
        "homestate": "NY",
        "interests": [
            {
                "name": "travel",
            }
        ],
        "gems": [
            {
                "city": "New York",
                "state": "NY",
                "description": "The Big Apple"
            }
        ],
        "badges": [
            {
                "name": "traveler",
                "description": "Traveled to 10 countries",
                "static_image_url": "https://example.com/traveler.png"
            }
        ],
        "gemsFound": 1,
        "badgesFound": 1
    }
}
```

- `POST /profile/update` (Authenticated)
```json
{
    "email": "new@example.com",
    "username": "NewUsername",
    "oldPassword": "OldPassword123!",
    "password": "NewPassword123!",
    "name": "Jane Doe",
    "phone": "+11234567890",
    "homestate": "CA",
    "interests": ["technology", "innovation", "science"]
}
```

```json
{
    "error": false,
    "data": {
        "message": "Profile updated successfully"
    }
}
```

### /navigation (navigation.js)

- `GET /navigation/geocode/:query` (Authenticated)

```
Query: "100 Main St, Nashville, TN"

{
    "error": false,
    "data": {
        "latitude": 36.1627,
        "longitude": -86.7816,
        "formatted_address": "100 Main St, Nashville, TN"
    }
}
```

- `GET /navigation/geocode/reverse/:latitude/:longitude` (Authenticated)

```
Latitude: 36.1627
Longitude: -86.7816

{
    "error": false,
    "data": {
        "road": "100 Main St",
        "city": "Nashville",
        "state": "Tennessee",
        "country": "United States"
    }
}
```

- `GET /navigation/geocode/reverse/poi/:latitude/:longitude` (Authenticated)

```
Latitude: 36.1627
Longitude: -86.7816

{
    "error": false,
    "data": {
        "city": "Nashville",
        "state": "Tennessee",
        "isGem": true,
        "isBadge": true
    }
}
```


- `GET /navigation/directions/:origin/:destination` (Authenticated)

```
Origin: "36.1627,-86.7816"
Destination: "36.1627,-86.7816"

{
    "error": false,
    "data": {
        "tripId": 1,
        "instructions": [],
        "distance": 100,
        "duration": 100,
        "prettySteps": []
    }
}
```

- `GET /navigation/directions/preview/:origin/:destination` (Authenticated)

```
Origin: "36.1627,-86.7816"
Destination: "36.1627,-86.7816"

{
    "error": false,
    "data": {
        "instructions": [],
        "distance": 100,
        "duration": 100,
        "prettySteps": []
    }
}
```



### /generate (generate.js)

- `GET /generate/trip/:tripId/city/:city/:state` (Authenticated)

```
Trip ID: 1
City: "Nashville"
State: "Tennessee"

{
    "error": false,
    "data": {
        "tripId": 1,
        "city": "Nashville",
        "state": "Tennessee",
        "facts": []
    }
}
```