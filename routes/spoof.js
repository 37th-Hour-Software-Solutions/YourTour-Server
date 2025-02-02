const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');
const OSRMTextInstructions = require("osrm-text-instructions");
const osrmTextInstructions = new OSRMTextInstructions("v5"); 
const { db } = require("../utils/database");

app.get("/simulate-drive", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { startLat, startLon, endLat, endLon, speedKmh, updateInterval } = req.query;

    if (!startLat || !startLon || !endLat || !endLon || !speedKmh || !updateInterval) {
        res.status(400).send("Missing required query parameters.");
        return;
    }

    try {
        // Step 1: Get route from OSRM
        const osrmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLongLat};${endLongLat}?overview=full&alternatives=false&steps=true`;
        const response = await axios.get(osrmUrl);
        const route = response.data.routes[0];

        if (!route) {
            res.status(500).send("No route found.");
            return;
        }

        // Step 2: Extract coordinates (GeoJSON format)
        const path = route.geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
        }));

        let index = 0;
        const interval = parseInt(updateInterval, 10);

        // Step 3: Simulate driving step-by-step
        const driveInterval = setInterval(() => {
            if (index >= path.length) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                clearInterval(driveInterval);
                res.end();
            } else {
                res.write(`data: ${JSON.stringify(path[index])}\n\n`);
                index++;
            }
        }, interval);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching route data.");
    }
});