const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const router = express.Router();
const models = require("../utils/models");
const { db } = require("../utils/database");
const { authenticateAccessToken } = require("../middleware/auth");

router.get('/', authenticateAccessToken, async (req, res) => {
    const getTripsStmt = db.prepare('SELECT trip_id, startingTown, endingTown, created_at FROM Trips WHERE user_id = ?');
    try{
        const userTrips = getTripsStmt.get(req.user.id);
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
})