const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();
router.use(bodyParser.json());

const getTimestamp = () => {
    return new Date().toUTCString();
};

let storedData = {};
let combinedData = {};

const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // This gives only the date part in yyyy-mm-dd
};

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
                        const dates = jsonItem.x.map(normalizeDate);
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
                            zScores: zScores,
                            source: 'CheckOnChain',
                            url: url
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

async function fetchWoocharts(name, url) {
    try {
        const response = await axios.get("https://woocharts.com/bitcoin-macro-oscillator/data/chart.json?1718986908477");
        const json_data = response.data;

        const col = json_data[name];
        const dates = col.x.map(normalizeDate);
        const values = col.y;
        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
        const zScores = values.map(value => (value - mean) / stdDev);

        dates.forEach((date, index) => {
            if (!combinedData[date]) {
                combinedData[date] = [];
            }
            combinedData[date].push(zScores[index]);
        })

        storedData[name] = {
            name: name,
            dates: dates,
            values: values,
            zScores: zScores,
            source: 'WooCharts',
            url: url
        };

        console.log(`{${getTimestamp()}} Fetched data for WooCharts ${name}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing woocharts: ${error}`);
    }
}

async function fetchLookintobitcoin(name, url, human_url) {
    try {
        const pathSegments = url.split('/');
        const indicator = pathSegments[3];

        const payload = {
            "output":"chart.figure",
            "outputs": {
                "id":"chart",
                "property": "figure"
            },
            "inputs":[{
                "id":"url",
                "property":"pathname",
                "value":`/charts/${indicator}/`
            }],
            "changedPropIds":["url.pathname"]
        }
        const response = await axios.post(url, payload);
        const jsonData = response.data;

        const data = jsonData.response.chart.figure.data;
        for (const plot of data) {
            if (plot.name === name) {
                const dates = plot.x.map(normalizeDate);
                const values = plot.y;
                const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
                const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
                const zScores = values.map(value => (value - mean) / stdDev);

                dates.forEach((date, index) => {
                    if (!combinedData[date]) {
                        combinedData[date] = [];
                    }
                    combinedData[date].push(zScores[index]);
                })

                storedData[name] = {
                    name: name,
                    dates: dates,
                    values: values,
                    zScores: zScores,
                    source: 'LookIntoBitcoin',
                    url: human_url
                };
            }
        }
        console.log(`{${getTimestamp()}} Fetched data for ${human_url}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing LookIntoBitcoin: ${error}`);
    }
}

async function fetchChainexposed(name, url) {
    try {
        const response = await axios.get(url);
        const data = response.data;

        const $ = cheerio.load(data);

        let scriptContent = '';
        $('script').each((i, elem) => {
            const scriptText = $(elem).html();
            if (scriptText.includes('Plotly.newPlot')) {
                scriptContent = scriptText;
            }
        });

        if (!scriptContent) {
            throw new Error("Plotly not found");
        }

        const trace1Match = scriptContent.match(/var trace1\s*=\s*\{[^}]*x\s*:\s*(\[[^\]]*\])[^}]*y\s*:\s*(\[[^\]]*\])/);
        if (!trace1Match) {
            throw new Error("trace1 not found");
        }

        const dates = JSON.parse(trace1Match[1]).map(normalizeDate);
        const values = JSON.parse(trace1Match[2]).map(val => parseFloat(val));
        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
        const zScores = values.map(value => (value - mean) / stdDev);

        dates.forEach((date, index) => {
            if (!combinedData[date]) {
                combinedData[date] = [];
            }
            combinedData[date].push(zScores[index]);
        })

        storedData[name] = {
            name: name,
            dates: dates,
            values: values,
            zScores: zScores,
            source: 'ChainExposed',
            url: url
        };

        console.log(`{${getTimestamp()}} Fetched data for ${url}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing ChainExposed: ${error}`);
    }
}

let d = "nig";

async function fetchCryptoquant(name, url, human_url) {
    try {
        const email = process.env.CRYPTOQUANT_EMAIL;
        const password = process.env.CRYPTOQUANT_PASSWORD;

        const headers = {
            'Content-Type': 'application/json',
            'Host': 'live-api.cryptoquant.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        };
        
        const response = await axios.post(
            "https://live-api.cryptoquant.com/api/v1/sign-in",
            { "email": email, "password": password },
            { headers: headers }
        );
        const accessToken = response.data.accessToken;

        const dashboardResponse = await axios.get(
            url,
            { headers: {...headers, 'Authorization': `Bearer ${accessToken}` }}
        );

        const result = dashboardResponse.data.data.result;
        const columns = result.columns;
        const results = result.results;
        
        const index = columns.findIndex(item => item.name === name);
        if (index === -1) {
            throw new Error("Indicator name is invalid")
        }

        const dates = results.map(row => row[0]).map(normalizeDate);
        const values = results.map(row => row[index]);
        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
        const zScores = values.map(value => (value - mean) / stdDev);

        dates.forEach((date, index) => {
            if (!combinedData[date]) {
                combinedData[date] = [];
            }
            combinedData[date].push(zScores[index]);
        })

        storedData[name] = {
            name: name,
            dates: dates,
            values: values,
            zScores: zScores,
            source: 'Cryptoquant',
            url: human_url
        };

        console.log(`{${getTimestamp()}} Fetched data for ${name} ${url}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing Cryptoquant: ${error}`);
    }
}

// Fetch woocharts
const woochartsIndicators = [
    ["index", "https://woocharts.com/bitcoin-macro-oscillator/"], 
    ["mvrv_z", "https://woocharts.com/bitcoin-mvrv-z/"]
]
woochartsIndicators.forEach(([name, url]) => fetchWoocharts(name, url));

// Fetch checkonchain indicators
const checkonchainIndicators = [
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_aviv_zscore/pricing_mvrv_aviv_zscore_light.html', 'AVIV Z-Score'],
    ['https://charts.checkonchain.com/btconchain/lifespan/lifespan_vddmultiple/lifespan_vddmultiple_light.html', 'VDD Multiple']
]
checkonchainIndicators.forEach(([ url, indicator ]) => fetchCheckOnChain(url, indicator, storedData, combinedData));

// Fetch lookintobitcoin indicators
const lookintobitcoinIndicators = [
    ["Oscillator", "https://www.lookintobitcoin.com/django_plotly_dash/app/pi_cycle_top_bottom_indicator/_dash-update-component", "https://www.lookintobitcoin.com/charts/pi-cycle-top-bottom-indicator/"]
]
lookintobitcoinIndicators.forEach(([ name, url, human_url]) => fetchLookintobitcoin(name, url, human_url));

// Fetch chainexposed indicators
const chainexposedIndicators = [
    ["MVRV", "https://chainexposed.com/XthMVRVShortTermHolderAddress.html"]
]
chainexposedIndicators.forEach(([ name, url ]) => fetchChainexposed(name, url));

// Fetch cryptoquant
const cryptoquantIndicators = [
    ["Adjusted_MVRV", "https://live-api.cryptoquant.com/api/v1/dashboard-entities/65b6f2f216020946ad992977/analytics/6463b524885a7d37a1630f8b", "https://cryptoquant.com/community/dashboard/65793eec53cdc86cfe167b91"]
]
cryptoquantIndicators.forEach(([ name, url, human_url]) => fetchCryptoquant(name, url, human_url));

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
