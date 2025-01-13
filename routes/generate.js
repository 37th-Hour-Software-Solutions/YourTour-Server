const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const router = express.Router();
const models = require("../utils/models");

async function getTextFromWikipedia(city, state) {
    // Build the Wikipedia URL
    const cityClean = city.replace(/ /g, "_");
    const stateClean = state.replace(/ /g, "_");
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${cityClean},_${stateClean}`;

    // Get the text of the page
    axios.get(wikipediaUrl)
        .then(response => {
            const $ = cheerio.load(response.data);
            const contentText = $("div#mw-content-text");
            const paragraphs = contentText.find("p");
            let text = "";
            paragraphs.each((index, paragraph) => {
                text += $(paragraph).text();
            });
            text = text.replace(/\n/g, '').replace(/\[\d+\]/g, '');
            return text;
        })
        .catch(error => {
            throw error;
        });
}

async function summarizeText(text, city, state) {
    return models.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: models.SUMMARY_PROMPT },
            { role: "user", content: `Here is the Wikipedia article for ${city}, ${state}: ${text}` }
        ],
        response_format: { type: "json_object" }
    })
    .then(response => {
        return JSON.parse(response.choices[0].message.content.trim());
    })
    .catch(error => {
        throw error;
    });
}

async function generateCityFacts(city, state) {
    const text = await getTextFromWikipedia(city, state);
    const summary = await summarizeText(text, city, state);
    return {
        city: city,
        state: state,
        summary: summary
    }
}

/**
 * Generate facts about a city
 * 
 * @param {string} city - The name of the city (required)
 * @param {string} state - The state of the city (required)
 * @returns {Object} - A JSON object with the facts about the city
 */

// TODO: Add caching so that we generate facts for a city only once, store it, and then return it.
// This will help keep API cost down, require speeds up, and overall ensure consistent facts to all users.
router.get("/city/:city/:state", async (req, res) => {
    const { city, state } = req.params;
    if (!city || !state) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const facts = await generateCityFacts(city, state);
        res.status(200).json(facts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
})

module.exports = router;
