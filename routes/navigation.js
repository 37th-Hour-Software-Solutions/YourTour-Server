const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');
const OSRMTextInstructions = require("osrm-text-instructions");
const osrmTextInstructions = new OSRMTextInstructions("v5"); 
const { db } = require("../utils/database");

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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid request parameters
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
 *         description: The starting point of the trip
 *       - in: path
 *         name: ending
 *         required: true
 *         schema:
 *           type: string
 *         description: The ending point of the trip
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid request parameters
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
    // Insert trip into the Trips table and get the last inserted tripId
    const insertTripStmt = db.prepare(
      "INSERT INTO Trips (user_id) VALUES (?)"
    );
    const result = insertTripStmt.run(req.user.id);
    const tripId = result.lastInsertRowid;

    // Fetch the route data
    const openstreetmap_url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${starting};${ending}?overview=full&alternatives=false&steps=true`;
    console.log(openstreetmap_url);

    const response = await axios.get(openstreetmap_url);
    const route = response.data;

    // Get the distance and time of the route
    const distance = (route.routes[0].distance / 1609.34).toFixed(2);
    const time = Math.ceil(route.routes[0].duration / 60);

    console.log(`Distance: ${distance} miles`);
    console.log(`Time: ${time} minutes`);

    const legs = route.routes[0].legs;

    legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const stepDistance = (step.distance / 1609.34).toFixed(2);
        const instruction = osrmTextInstructions.compile("en", step);
        console.log(`(${stepDistance} miles): ${instruction}`);
      });
    });

    res.status(200).json({
      error: false,
      data: {
        tripId,
        route: legs,
        distance,
        time,
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
 *         description: The starting point of the trip
 *       - in: path
 *         name: ending
 *         required: true
 *         schema:
 *           type: string
 *         description: The ending point of the trip
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid request parameters
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

    // Fetch the route data
    const openstreetmap_url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${starting};${ending}?overview=full&alternatives=false&steps=true`;
    console.log(openstreetmap_url);

    const response = await axios.get(openstreetmap_url);
    const route = response.data;

    // Get the distance and time of the route
    const distance = (route.routes[0].distance / 1609.34).toFixed(2);
    const time = Math.ceil(route.routes[0].duration / 60);

    console.log(`Distance: ${distance} miles`);
    console.log(`Time: ${time} minutes`);

    const legs = route.routes[0].legs;

    legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const stepDistance = (step.distance / 1609.34).toFixed(2);
        const instruction = osrmTextInstructions.compile("en", step);
        console.log(`(${stepDistance} miles): ${instruction}`);
      });
    });

    res.status(200).json({
      error: false,
      data: {
        route: legs,
        distance,
        time,
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

module.exports = router;
