const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');

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
                'User-Agent': 'YourTour/1.0 (me@landon.pw)'
            }
        });
        
        if (response.data.length === 0) {
            throw new Error(`Geocoding failed: No results found`);
        }
        
        const location = response.data[0];
        return {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            formatted_address: location.display_name
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
 *     tags: [Geocode]
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
                message: 'Missing required address field'
            }
        });
    }

    try {
        const coordinates = await getCoordinatesFromAddress(address);
        res.status(200).json({
            error: false,
            data: coordinates
        });
    } catch (error) {
        console.error('Geocode route error:', error);
        res.status(500).json({
            error: true,
            data: {
                message: process.env.NODE_ENV === 'development' ? 
                    error.stack : 
                    'Internal server error'
            }
        });
    }
});

module.exports = router;
