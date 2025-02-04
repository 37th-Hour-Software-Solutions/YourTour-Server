const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const router = express.Router();
const models = require("../utils/models");
const { db } = require("../utils/database");
const { authenticateAccessToken } = require("../middleware/auth");

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get the last 20 trips
 *     description: Returns the last 20 trips for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     tags: [History]
 *     responses:
 *       200:
 *         description: Successfully retrieved trip history
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
 *                     trip_id:
 *                       type: integer
 *                     startingTown:
 *                       type: string
 *                     endingTown:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time the trip was created
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAccessToken, async (req, res) => {
  const getTripsStmt = db.prepare('SELECT id, startingTown, endingTown, created_at FROM Trips WHERE user_id = ? ORDER BY created_at DESC LIMIT 20');

  try {
    const userTrips = getTripsStmt.all(req.user.id);
    return res.json({ error: false, data: userTrips });
  } catch (error){
    return res.status(500).json({
      error: true,
      data: {
        message: process.env.NODE_ENV === 'development' ? 
          error.stack : 
          'Internal server error'
        }
    });
  }
});

/**
 * @swagger
 * /history/trip/{id}:
 *   get:
 *     summary: Get all cities visited in a trip
 *     description: Returns all cities and their facts for a specific trip ID
 *     security:
 *       - bearerAuth: []
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The trip ID
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved trip history
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
 *                       type: integer
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           city:
 *                             type: string
 *                           state:
 *                             type: string
 *                           facts:
 *                             type: object
 *                           is_gem:
 *                             type: boolean
 *                           visited_at:
 *                             type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.get('/trip/:id', authenticateAccessToken, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  if (!tripId || !Number.isInteger(parseInt(tripId))) {
    return res.status(400).json({
      error: true,
      data: {
        message: "Missing required fields"
      }
    });
  }

  try {
    // First verify the trip belongs to the user
    const checkTripStmt = db.prepare(
      "SELECT id FROM Trips WHERE id = ? AND user_id = ?"
    );

    const trip = checkTripStmt.get(tripId, userId);

    if (!trip) {
      return res.status(404).json({
        error: true,
        data: {
          message: 'Trip not found'
        }
      });
    }

    // Get all locations for this trip
    const getLocationsStmt = db.prepare(`
      SELECT 
        l.id,
        l.city,
        l.state,
        l.facts,
        l.is_gem,
        h.created_at as visited_at
      FROM History h
        JOIN Locations l ON h.location_id = l.id
        WHERE h.trip_id = ? AND h.user_id = ?
        ORDER BY h.created_at DESC
    `);

    const locations = getLocationsStmt.all(tripId, userId);

    if (locations.length === 0) {
      return res.status(404).json({
        error: true,
        data: {
          message: "No locations found for this trip"
        }
      });
    }

    // Parse the JSON facts for each location
    const formattedLocations = locations.map(location => ({
      id: location.id,
      city: location.city,
      state: location.state,
      facts: JSON.parse(location.facts),
      is_gem: Boolean(location.is_gem),
      visited_at: location.visited_at
    }));

    return res.status(200).json({
      error: false,
      data: {
        tripId: parseInt(tripId),
        cities: formattedLocations
      }
    });
  } catch (error) {
    console.error('Trip history error:', error);
    return res.status(500).json({
      error: true,
      data: {
        message: process.env.NODE_ENV === 'development' ? 
          error.stack : 
          'Internal server error'
      }
    });
  }
});

/**
 * @swagger
 * /history/location/{id}:
 *   get:
 *     summary: Get a location by ID
 *     description: Returns a location by its ID
 *     security:
 *       - bearerAuth: []
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The location ID
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.get('/location/:id', authenticateAccessToken, async (req, res) => {
  const locationId = req.params.id;

  if (!locationId || !Number.isInteger(parseInt(locationId))) {
    return res.status(400).json({
      error: true,
      data: {
        message: "Missing required fields"
      }
    });
  }

  const getLocationStmt = db.prepare('SELECT * FROM Locations WHERE id = ?');
  const location = getLocationStmt.get(locationId);

  if (!location) {
    return res.status(404).json({
      error: true,
      data: {
        message: "Location not found"
      }
    });
  }

  return res.json({ error: false, data: location });
});

module.exports = router;