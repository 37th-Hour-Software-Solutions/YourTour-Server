const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const router = express.Router();
const { client, SUMMARY_PROMPT } = require('../utils/models');
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * Fetches and cleans text from a Wikipedia page
 * @param {string} city - The name of the city
 * @param {string} state - The state of the city
 * @returns {Promise<string>} The cleaned Wikipedia text
 * @throws {Error} If the page cannot be fetched or parsed
 */
async function getTextFromWikipedia(city, state) {
    try {
        const cityClean = encodeURIComponent(city.replace(/ /g, '_'));
        const stateClean = encodeURIComponent(state.replace(/ /g, '_'));
        const wikipediaUrl = `https://en.wikipedia.org/wiki/${cityClean},_${stateClean}`;

        const response = await axios.get(wikipediaUrl);
        const $ = cheerio.load(response.data);
        
        const paragraphs = $('div#mw-content-text p')
            .map((_, el) => $(el).text())
            .get()
            .join(' ');

        return paragraphs.replace(/\n/g, ' ')
                        .replace(/\[\d+\]/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Summarizes text using AI model
 * @param {string} text - The text to summarize
 * @param {string} city - The name of the city
 * @param {string} state - The state of the city
 * @returns {Promise<Object>} The summarized content
 * @throws {Error} If the summarization fails
 */
async function summarizeText(text, city, state) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SUMMARY_PROMPT },
                { role: "user", content: `Here is the Wikipedia article for ${city}, ${state}: ${text}` }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content.trim());
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Generates or retrieves facts about a city
 * @param {string} city - The name of the city
 * @param {string} state - The state of the city
 * @returns {Object} City facts and metadata
 * @throws {Error} If database operations fail
 */
async function generateCityFacts(city, state) {
    try {
        // Prepare statements
        const selectStmt = db.prepare(
            'SELECT * FROM Locations WHERE city = ? AND state = ?'
        );
        const insertStmt = db.prepare(
            'INSERT INTO Locations (city, state, facts, is_gem) VALUES (?, ?, ?, ?)'
        );

        // Check if we have cached data
        const existingLocation = selectStmt.get(city, state);

        if (existingLocation) {
            return {
                city: existingLocation.city,
                state: existingLocation.state,
                facts: JSON.parse(existingLocation.facts),
                is_gem: Boolean(existingLocation.is_gem)
            };
        }

        // Generate new data
        const text = await getTextFromWikipedia(city, state);
        const summary = await summarizeText(text, city, state);

        // Store in database
        insertStmt.run(city, state, JSON.stringify(summary), 0);

        return {
            city,
            state,
            facts: summary,
            is_gem: false
        };
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * @swagger
 * /generate/{city}/{state}:
 *   get:
 *     summary: Generate or retrieve facts about a city
 *     description: Returns facts about a specified city, either from cache or newly generated
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
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.get('/:city/:state', authenticateToken, async (req, res) => {
    const { city, state } = req.params;

    if (!city || !state) {
        return res.status(400).json({
            error: true,
            data: 'Missing required fields'
        });
    }

    try {
        const facts = await generateCityFacts(city, state);
        res.status(200).json({
            error: false,
            data: facts
        });
    } catch (error) {
        console.error('Generate route error:', error);
        res.status(500).json({
            error: true,
            data: process.env.NODE_ENV === 'development' ? 
                error.stack : 
                'Internal server error'
        });
    }
});

module.exports = router;
