const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();
router.use(bodyParser.json());

router.post('/process_checkonchain', async (req, res) => {
    const { indicator } = req.body;

    try {
        const response = await axios.get(indicator.api_url);
        const htmlContent = response.data;

        // Load HTML content into Cheerio for parsing
        const $ = cheerio.load(htmlContent);
        const scriptContent = $('script').filter((i, script) => {
            return $(script).html().includes('Plotly.newPlot');
        }).html();

        if (scriptContent) {
            const jsonStartIndex = scriptContent.indexOf('[{');
            const jsonEndIndex = scriptContent.lastIndexOf('}"}]');

            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                const jsonData = scriptContent.substring(jsonStartIndex, jsonEndIndex + 4);
                const jsonObjects = JSON.parse(jsonData);

                jsonObjects.forEach(jsonItem => {
                    if (jsonItem.name === indicator.indicator_column_name) {
                        res.status(200).json({
                            name: jsonItem.name,
                            dates: jsonItem.x,
                            values: jsonItem.y
                        });
                    }
                });
            } else {
                throw new Error('JSON data not found within the Plotly script');
            }
        } else {
            throw new Error(`Plotly script not found on webpage ${indicator.api_url}`);
        }
    } catch (error) {
        console.error('Error processing indicator:', error);
        res.status(400).json({
            error: error.message
        });
    }
});

module.exports = router;
