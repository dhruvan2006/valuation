const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();
router.use(bodyParser.json());

const getTimestamp = () => {
    return new Date().toUTCString();
};

let storedData = {};
let combinedData = {};

async function fetchCheckOnChain(api_url, indicator_column_name) {
    try {
        const response = await axios.get(api_url);
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
                    if (jsonItem.name === indicator_column_name) {
                        const dates = jsonItem.x;
                        const values = jsonItem.y;
                        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
                        const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
                        const zScores = values.map(value => (value - mean) / stdDev);

                        dates.forEach((date, index) => {
                            if (!combinedData[date]) {
                                combinedData[date] = [];
                            }
                            combinedData[date].push(zScores[index]);
                        })

                        storedData[jsonItem.name] = {
                            name: jsonItem.name,
                            dates: dates,
                            values: values,
                            zScores: zScores
                        };
                        console.log(`{${getTimestamp()}} Fetched data for ${api_url}`)
                    }
                });
            } else {
                throw new Error('JSON data not found within the Plotly script');
            }
        } else {
            throw new Error(`Plotly script not found on webpage ${api_url}`);
        }
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing indicator: ${error}`);
    }
};
indicators = [['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_aviv_zscore/pricing_mvrv_aviv_zscore_light.html', 'AVIV Z-Score'],
              ['https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Price'],
              ['https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Mayer Multiple Z']]
indicators.forEach(([ url, indicator ]) => fetchCheckOnChain(url, indicator));

router.get('/', (req, res) => {
    let averagedData = {};

    for (const date in combinedData) {
        const zScores = combinedData[date];
        const avgZScore = zScores.reduce((acc, val) => acc + val, 0) / zScores.length;
        averagedData[date] = avgZScore;
    }

    res.json(averagedData);
});

router.get('/indicator/:name', (req, res) => {
    const indicatorName = req.params.name;
    const indicatorData = storedData[indicatorName];

    if (indicatorData) {
        res.json(indicatorData);
    } else {
        res.status(404).json({ error: 'Indicator not found' });
    }
});

module.exports = router;
