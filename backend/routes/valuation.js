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

async function fetchCheckOnChain(url, indicator_column_name, storedData, combinedData) {
    try {
        const response = await axios.get(url);
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
                        console.log(`{${getTimestamp()}} Fetched data for ${url}`)
                    }
                });
            } else {
                throw new Error('JSON data not found within the Plotly script');
            }
        } else {
            throw new Error(`Plotly script not found on webpage ${url}`);
        }
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing checkonchain: ${error}`);
    }
}

let d = [];

async function fetchWoocharts(indicator_column_name) {
    try {
        const response = await axios.get("https://woocharts.com/bitcoin-macro-oscillator/data/chart.json?1718986908477");
        const json_data = response.data;

        // const col = indicator_column_name;
        // const x = json_data.col.x;
        // const y = json_data.co.y;

        d = json_data;
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing woocharts: ${error}`);
    }
}

// Fetch woocharts
fetchWoocharts("price");

// Fetch checkonchain indicators
indicators = [['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_aviv_zscore/pricing_mvrv_aviv_zscore_light.html', 'AVIV Z-Score'],
              ['https://charts.checkonchain.com/btconchain/realised/realised_sopr/realised_sopr_light.html', 'SOPR 7D-EMA'],
              ['https://charts.checkonchain.com/btconchain/mining/mining_difficultyregression/mining_difficultyregression_light.html', 'Difficulty Multiple'],
              ['https://charts.checkonchain.com/btconchain/lifespan/lifespan_vddmultiple/lifespan_vddmultiple_light.html', 'VDD Multiple'],
              ['https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Mayer Multiple Z']]
indicators.forEach(([ url, indicator ]) => fetchCheckOnChain(url, indicator, storedData, combinedData));

// Fetch bitcoin price
bitcoinData = {}
bitcoinCombined = {}
fetchCheckOnChain('https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Price', bitcoinData, bitcoinCombined)

router.get('/bitcoin', (req, res) => {
    res.json(bitcoinData.Price);
});

router.get('/hi', (req, res) => {
    res.send(d);
});

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
