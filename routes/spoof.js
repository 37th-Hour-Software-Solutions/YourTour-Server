const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');
const OSRMTextInstructions = require("osrm-text-instructions");
const osrmTextInstructions = new OSRMTextInstructions("v5"); 
const { db } = require("../utils/database");
const polyline = require('polyline');

router.get("/:start/:end", authenticateAccessToken, async (req, res) => {
    const { start, end } = req.params;

    if (!start || !end) {
        res.status(400).send("Missing required query parameters.");
        return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Step 1: Get route from OSRM
        console.log("Start:", start);
        console.log("End:", end);

        // Remove any spaces and validate coordinates
        const [startLat, startLon] = start.split(',').map(coord => parseFloat(coord.trim()));
        const [endLat, endLon] = end.split(',').map(coord => parseFloat(coord.trim()));

        // Validate coordinates
        if (isNaN(startLat) || isNaN(startLon) || isNaN(endLat) || isNaN(endLon)) {
            throw new Error("Invalid coordinates format");
        }

        // Format coordinates for OSRM (longitude,latitude format)
        const formattedStart = `${startLon},${startLat}`;
        const formattedEnd = `${endLon},${endLat}`;

        const osrmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${formattedStart};${formattedEnd}?overview=full&alternatives=false&steps=true`;
        
        const response = await axios.get(osrmUrl);
        const route = response.data.routes[0];

        if (!route) {
            res.write(`data: ${JSON.stringify({ error: "No route found" })}\n\n`);
            res.end();
            return;
        }

        // Step 2: Decode the polyline string into coordinates
        const path = polyline.decode(route.geometry);

        // Convert the polyline coordinates to {latitude, longitude} objects
        const pathWithLatLon = path.map(coord => ({
            latitude: coord[0],
            longitude: coord[1]
        }));

        // Step 3: Simulate driving step-by-step
        let index = 0;
        const interval = 5000; // 5 seconds

        // Handle client disconnection
        req.on('close', () => {
            if (driveInterval) {
                clearInterval(driveInterval);
            }
        });

        const driveInterval = setInterval(() => {
            if (index >= pathWithLatLon.length) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                clearInterval(driveInterval);
                res.end();
            } else {
                res.write(`data: ${JSON.stringify(pathWithLatLon[index])}\n\n`);
                index++;
            }
        }, interval);

    } catch (error) {
        console.error('Error:', error.message);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

module.exports = router;