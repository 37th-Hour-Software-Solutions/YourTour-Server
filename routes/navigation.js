const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');
const OSRMTextInstructions = require("osrm-text-instructions");
const osrmTextInstructions = new OSRMTextInstructions("v5"); 
const { db } = require("../utils/database");
const GEMS = require('../utils/config.js');
const e = require('express');

/**
 * Fetches latitude and longitude from an address using Nominatim API
 * @param {string} address - The full address input by the user
 * @returns {Promise<Object>} The latitude and longitude of the address
 * @throws {Error} If the Nominatim API request fails
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

    const response = await axios.get(nominatimUrl, {
      headers: {
        "User-Agent": "YourTour/1.0 (me@landon.pw)",
      },
    });
        
    if (response.data.length === 0) {
      throw new Error(`Geocoding failed: No results found`);
    }

    const location = response.data[0];
    return {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      formatted_address: location.display_name,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getAddressFromCoordinates = async (latitude, longitude) => {

  try{
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`; 

    const response = await axios.get(nominatimUrl, {
      headers: {
        "User-Agent": "YourTour/1.0 (me@landon.pw)",
      }
    });

    if (response.data.length === 0) {
      throw new Error(`Geocoding failed: No results found`);
    }

    return {
      road: response.data.address.road,
      city: response.data.address.city,
      state: response.data.address.state,
      country: response.data.address.country
    };
  } catch(error){
    throw new Error(error);
  }
}

/**
 * Fetches a city and state from a given latitude and longitude using the GeoDB API
 * The city is determined by weighting the city's population and distance from the user's current location
 * @param {number} latitude - The latitude of the user's current location
 * @param {number} longitude - The longitude of the user's current location
 * @returns {Promise<Object>} The city and state of the user's current location
 * @throws {Error} If the GeoDB API request fails
 */
const getCityFromCoordinates = async (latitude, longitude) => {
  try{

    const rapidAPIUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/locations/${latitude}${longitude}/nearbyCities?types=CITY&radius=50&distanceUnit=MI&minPopulation=100`;
    const response = await axios.get(rapidAPIUrl, {
      headers: {
        "User-Agent": "YourTour/1.0 (me@landon.pw)",
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
        "x-rapidapi-key": "9d3044f73fmshd0399a50c7f2f9fp17631bjsn9a31e55b945d"
      }
    });

    if (response.data.length === 0) {
      throw new Error(`Geocoding failed: No results found`);
    }

    let weights = [];

    for (const val of response.data.data) {
      const population = val.population;
      const distance = val.distance;

      const preference = (0.6 * (1-(distance/50))) + (0.4 * (population/1000000));
     
      weights.push({"preference": preference, "city": val.city, "state": val.region});
    }

    weights.sort((a, b) => b.preference - a.preference);
    const best = weights[0];

    return {
        city: best.city,
        state: best.state
    };
  } catch(error){
    throw new Error(error);
  }
}

/**
 * @swagger
 * /navigation/geocode/{address}:
 *   get:
 *     summary: Get latitude and longitude from an address
 *     description: Returns the latitude and longitude of a specified address
 *     security:
 *       - bearerAuth: []
 *     tags: [Navigation]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: The full address to geocode
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved coordinates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     formatted_address:
 *                       type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/geocode/:address', authenticateAccessToken, async (req, res) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({
      error: true,
      data: {
        message: "Missing required address field",
      },
    });
  }

  try {
    const coordinates = await getCoordinatesFromAddress(address);
    res.status(200).json({
      error: false,
      data: coordinates,
    });
  } catch (error) {
    console.error("Geocode route error:", error);
    res.status(500).json({
      error: true,
      data: {
        message: process.env.NODE_ENV === 'development' ? 
          error.stack :
          "Internal server error",
      },
    });
  }
});

/**
 * @swagger
 * /navigation/geocode/reverse/{latitude}/{longitude}:
 *   get:
 *     summary: Get address from latitude and longitude
 *     description: Returns the address from a specified latitude and longitude
 *     security:
 *       - bearerAuth: []
 *     tags: [Navigation]
 *     parameters:
 *       - in: path
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: The latitude of the address
 *       - in: path
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: The longitude of the address
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     road:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     country:
 *                       type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/geocode/reverse/:latitude/:longitude', authenticateAccessToken, async (req, res) => {
  const { latitude, longitude } = req.params;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: true,
      data: { message: "Missing required fields" },
    });
  }

  try {
    const address = await getAddressFromCoordinates(latitude, longitude);
    res.status(200).json({
      error: false,
      data: address,
    });
  } catch (error) {
    console.error("Geocode route error:", error);
    res.status(500).json({
      error: true,
      data: {
        message: process.env.NODE_ENV === 'development' ? 
          error.stack :
          "Internal server error",
      },
    });
  }
});

/**
 * @swagger
 * /navigation/geocode/reverse/poi/{latitude}/{longitude}:
 *   get:
 *     summary: Get city and state from latitude and longitude
 *     description: Returns a POI (Point of Interest) from a specified latitude and longitude
 *     security:
 *       - bearerAuth: []
 *     tags: [Navigation]
 *     parameters:
 *       - in: path
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: The latitude of the address
 *       - in: path
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: The longitude of the address
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved city and state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     isGem:
 *                       type: boolean
 *                     isBadge:
 *                       type: boolean
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/geocode/reverse/poi/:latitude/:longitude', authenticateAccessToken, async (req, res) => {
  const { latitude, longitude } = req.params;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: true,
      data: { message: "Missing required fields" },
    });
  }

  const {city, state} = await getCityFromCoordinates(latitude, longitude);

  // Determine if the city is a gem
  const isGem = await db.prepare("SELECT COUNT(*) count FROM Gems WHERE city = ? AND state = ?").get(city, state).count > 0;

  if (isGem) {
    const stmtInsertUserGem = db.prepare("INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (?, (SELECT id FROM Gems WHERE city = ? AND state = ?))");
    stmtInsertUserGem.run(req.user.id, city, state);
  }

  // Reward user with badges
  const isBadge = false;

  // State badges - Count unique states visited
  const stmtGetUserStates = db.prepare(`
      SELECT COUNT(DISTINCT l.state) as count
      FROM History h
      JOIN Locations l ON h.location_id = l.id
      WHERE h.user_id = ?
  `);
  const userStates = stmtGetUserStates.get(req.user.id);

  // Check state badge thresholds
  if (userStates.count == 3) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Explorer I'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userStates.count == 5) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Explorer II'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userStates.count == 10) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Explorer III'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userStates.count == 20) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Explorer IV'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userStates.count == 50) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Explorer V'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  }

  // City badges - Count unique cities visited
  const stmtGetUserCities = db.prepare(`
      SELECT COUNT(DISTINCT l.city || '_' || l.state) as count
      FROM History h
      JOIN Locations l ON h.location_id = l.id
      WHERE h.user_id = ?
  `);
  const userCities = stmtGetUserCities.get(req.user.id);

  // Check city badge thresholds
  if (userCities.count == 10) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Tourist I'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userCities.count == 20) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Tourist II'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userCities.count == 50) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Tourist III'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userCities.count == 100) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Tourist IV'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  } else if (userCities.count == 500) {
      const badgeIdStmt = db.prepare("SELECT id FROM Badges WHERE name = 'Tourist V'");
      const stmtInsertUserBadge = db.prepare("INSERT INTO UserBadges (user_id, badge_id) VALUES (?, ?)");
      stmtInsertUserBadge.run(req.user.id, badgeIdStmt.get().id);
      isBadge = true;
  }

  res.status(200).json({
      error: false,
      data: {
        city: city,
        state: state,
        isGem: isGem,
        isBadge: isBadge
      },
  });
});

/**
 * @swagger
 * /navigation/directions/{starting}/{ending}:
 *   get:
 *     summary: Get directions from one point to another
 *     description: Returns the directions from one point to another
 *     security:
 *       - bearerAuth: []
 *     tags: [Navigation]
 *     parameters:
 *       - in: path
 *         name: starting
 *         required: true
 *         schema:
 *           type: string
 *         description: The starting lat,long of the trip
 *       - in: path
 *         name: ending
 *         required: true
 *         schema:
 *           type: string
 *         description: The ending lat,long of the trip
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved directions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tripId:
 *                       type: number
 *                     route:
 *                       type: array
 *                     distance:
 *                       type: number
 *                     time:
 *                       type: number
 *                     prettySteps:
 *                       type: array
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/directions/:starting/:ending", authenticateAccessToken, async (req, res) => {
  const { starting, ending } = req.params;

  if (!starting || !ending) {
    return res.status(400).json({
      error: true,
      data: { message: "Missing required fields" },
    });
  }

  try {
    const [startLat, startLon] = starting.split(",");
    const [endLat, endLon] = ending.split(",");

    const startTown = await getAddressFromCoordinates(startLat, startLon);
    const endTown = await getAddressFromCoordinates(endLat, endLon);

    startAddress = startTown.city + ", " + startTown.state;
    endAddress = endTown.city + ", " + endTown.state;

    // For some reason, OSRM expects long,lat instead of lat,long so we need to swap them
    const startLongLat = `${startLon},${startLat}`;
    const endLongLat = `${endLon},${endLat}`;

    // Insert trip into the Trips table and get the last inserted tripId
    const insertTripStmt = db.prepare(
      "INSERT INTO Trips (user_id, startingTown, endingTown) VALUES (?,?,?)"
    );
    const result = insertTripStmt.run(req.user.id, startAddress, endAddress);
    
    const tripId = result.lastInsertRowid;
    const osmURL = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLongLat};${endLongLat}?overview=full&alternatives=false&steps=true`;

    const response = await axios.get(osmURL);
    const route = response.data['routes'][0];

    // Get the distance and time of the route
    const distance = (route['distance'] / 1609.34).toFixed(2);
    const time = Math.ceil(route['duration'] / 60);

    const legs = route['legs'];
    const prettySteps = [];

    legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const stepDistance = (step.distance / 1609.34).toFixed(2);
        const instruction = osrmTextInstructions.compile("en", step);
        prettySteps.push({
          distance: stepDistance,
          instruction: instruction
        });
      });
    });

    res.status(200).json({
      error: false,
      data: {
        tripId,
        route: legs,
        distance,
        time,
        prettySteps: prettySteps
      },
    });
  } catch (error) {
    console.error("Directions route error:", error);
    res.status(500).json({
      error: true,
      data: {
        message:
          process.env.NODE_ENV === "development"
            ? error.stack
            : "Internal server error",
        },
      });
    }
  }
);

/**
 * @swagger
 * /navigation/directions/preview/{starting}/{ending}:
 *   get:
 *     summary: Get directions from one point to another
 *     description: Returns the directions from one point to another
 *     security:
 *       - bearerAuth: []
 *     tags: [Navigation]
 *     parameters:
 *       - in: path
 *         name: starting
 *         required: true
 *         schema:
 *           type: string
 *         description: The starting lat,long of the trip
 *       - in: path
 *         name: ending
 *         required: true
 *         schema:
 *           type: string
 *         description: The ending lat,long of the trip
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved directions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: 
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     route:
 *                       type: array
 *                     distance:
 *                       type: number
 *                     time:
 *                       type: number
 *                     prettySteps:
 *                       type: array
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/directions/preview/:starting/:ending", authenticateAccessToken, async (req, res) => {
  const { starting, ending } = req.params;

  if (!starting || !ending) {
    return res.status(400).json({
      error: true,
      data: { message: "Missing required fields" },
    });
  }

  try {

    const [startLat, startLon] = starting.split(",");
    const [endLat, endLon] = ending.split(",");

    const startLongLat = `${startLon},${startLat}`;
    const endLongLat = `${endLon},${endLat}`;


    // Fetch the route data
    const osmURL = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLongLat};${endLongLat}?overview=full&alternatives=false&steps=true`;

    const response = await axios.get(osmURL);
    const route = response.data;

    // Get the distance and time of the route
    const distance = (route.routes[0].distance / 1609.34).toFixed(2);
    const time = Math.ceil(route.routes[0].duration / 60);

    const legs = route.routes[0].legs;
    const prettySteps = [];

    legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const stepDistance = (step.distance / 1609.34).toFixed(2);
        const instruction = osrmTextInstructions.compile("en", step);
        prettySteps.push({
          distance: stepDistance,
          instruction: instruction
        });
      });
    });

    res.status(200).json({
      error: false,
      data: {
        route: legs,
        distance,
        time,
        prettySteps: prettySteps
      },
    });
  } catch (error) {
    console.error("Directions route error:", error);
    res.status(500).json({
      error: true,
      data: {
        message:
          process.env.NODE_ENV === "development"
            ? error.stack
            : "Internal server error",
        },
      });
    }
  }
);


/**
 * @swagger
 * /navigation/autocomplete/{latitude}/{longitude}/{query}:
 *   get:
 *     summary: Get address suggestions
 *     description: Fetch address suggestions based on the provided query and optional user location.
 *     tags: [Navigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: latitude
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *       - name: query
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: A list of address suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "123 Main St, New York"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

// Fetch address suggestions from the HERE API
const fetchSuggestions = async ( coords, query) => {
  const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${query}&at=${coords}&apiKey=${process.env.HERE_API_KEY}`;
  
  try {
    const response = await axios.get(url);
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Autocomplete route to get suggestions
router.get('/autocomplete/:latitude/:longitude/:query', authenticateAccessToken, async (req, res) => {
  const { latitude, longitude, query } = req.params;  // Get query and location from request
  try {
    const suggestions = await fetchSuggestions(latitude + ',' + longitude, query);
    res.status(200).json({ error: false, data: suggestions });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Failed to fetch suggestions' });
  }
});

module.exports = router;