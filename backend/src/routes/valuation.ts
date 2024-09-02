import express from 'express';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import axios from 'axios';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
import { getTimestamp } from '../app';

dotenv.config();

const router = express.Router();
router.use(bodyParser.json());

type IndicatorData = {
    name: string;
    dates: string[];
    values: number[];
    source: string;
    url: string;
}

type storedData = {
    [key: string]: IndicatorData;
}

// // Increase limit for cryptoquant POST
// router.use(bodyParser.json({ limit: '50mb' }));

let lastUpdated = Date.now();

let storedData: storedData = {};

const normalizeDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // This gives only the date part in yyyy-mm-dd
};

async function fetchCheckOnChain(url: string, indicator_column_name: string, storedData: storedData) {
    try {
        const response = await axios.get(url);
        const htmlContent = response.data;

        // Load HTML content into Cheerio for parsing
        const $ = cheerio.load(htmlContent);
        const scriptContent = $('script').filter((i, script) => {
            const htmlContent = $(script).html()
            return htmlContent ? htmlContent.includes('Plotly.newPlot') : false;
        }).html();

        if (scriptContent) {
            const jsonStartIndex = scriptContent.indexOf('[{');
            const jsonEndIndex = scriptContent.lastIndexOf('}"}]');

            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                const jsonData = scriptContent.substring(jsonStartIndex, jsonEndIndex + 4);
                const jsonObjects = JSON.parse(jsonData);

                jsonObjects.forEach((jsonItem: any) => {
                    if (jsonItem.name === indicator_column_name) {
                        const dates = jsonItem.x.map(normalizeDate);
                        const values = jsonItem.y;

                        storedData[jsonItem.name] = {
                            name: jsonItem.name,
                            dates: dates,
                            values: values,
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

async function fetchWoocharts(name: string, url: string, storedData: storedData) {
    try {
        const response = await axios.get("https://woocharts.com/bitcoin-macro-oscillator/data/chart.json?1718986908477");
        const json_data = response.data;

        const col = json_data[name];
        const dates = col.x.map(normalizeDate);
        const values = col.y;

        storedData[name] = {
            name: name,
            dates: dates,
            values: values,
            source: 'WooCharts',
            url: url
        };

        console.log(`{${getTimestamp()}} Fetched data for WooCharts ${name}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing woocharts: ${error}`);
    }
}

async function fetchLookintobitcoin(name: string, indicatorName: string, url: string, human_url: string, storedData: storedData) {
    try {
        const payload = {
            "output":"chart.figure",
            "outputs": {
                "id":"chart",
                "property": "figure"
            },
            "inputs":[{
                "id":"url",
                "property":"pathname",
                "value":`/charts/${indicatorName}/`
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

                storedData[indicatorName] = {
                    name: indicatorName,
                    dates: dates,
                    values: values,
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

async function fetchChainexposed(name: string, url: string, storedData: storedData) {
    try {
        const response = await axios.get(url);
        const data = response.data;

        const $ = cheerio.load(data);

        let scriptContent = '';
        $('script').each((i, elem) => {
            const scriptText = $(elem).html();
            if (scriptText && scriptText.includes('Plotly.newPlot')) {
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
        const values = JSON.parse(trace1Match[2]).map((val: string) => parseFloat(val));

        storedData[name] = {
            name: name,
            dates: dates,
            values: values,
            source: 'ChainExposed',
            url: url
        };

        console.log(`{${getTimestamp()}} Fetched data for ${url}`)
    } catch (error) {
        console.error(`{${getTimestamp()}} Error processing ChainExposed: ${error}`);
    }
}

// Fetch woocharts
const woochartsIndicators = [
    ["index", "https://woocharts.com/bitcoin-macro-oscillator/"], 
    ["mvrv_z", "https://woocharts.com/bitcoin-mvrv-z/"]
]

// Fetch checkonchain indicators
const checkonchainIndicators = [
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_aviv_zscore/pricing_mvrv_aviv_zscore_light.html', 'AVIV Z-Score'],
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_all_zscore/pricing_mvrv_all_zscore_light.html', 'MVRV Z-Score'],
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_mvrv_sth_zscore/pricing_mvrv_sth_zscore_light.html', 'STH-MVRV Z-Score'],
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_nupl_bycohort/pricing_nupl_bycohort_light.html', 'LTH-NUPL'],
    ['https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Mayer Multiple Z'],
    ['https://charts.checkonchain.com/btconchain/realised/realised_sopr/realised_sopr_light.html', 'SOPR 7D-EMA'],
    // ['https://charts.checkonchain.com/btconchain/lifespan/lifespan_vddmultiple/lifespan_vddmultiple_light.html', 'VDD Multiple'],
    ['https://charts.checkonchain.com/btconchain/lifespan/lifespan_reserverisk/lifespan_reserverisk_light.html', 'Reserve Risk (Adjusted)'],
    ['https://charts.checkonchain.com/btconchain/mining/mining_difficultyregression/mining_difficultyregression_light.html', 'Difficulty Multiple']
]

// Fetch lookintobitcoin indicators
const lookintobitcoinIndicators = [
    ["Oscillator", "pi_cycle_top_bottom_indicator", "https://www.lookintobitcoin.com/django_plotly_dash/app/pi_cycle_top_bottom_indicator/_dash-update-component", "https://www.lookintobitcoin.com/charts/pi-cycle-top-bottom-indicator/"],
    ["VDD Multiple", "value-days-destroyed-multiple", "https://www.lookintobitcoin.com/django_plotly_dash/app/vdd_multiple/_dash-update-component", "https://www.lookintobitcoin.com/charts/value-days-destroyed-multiple/"]
]

// Fetch chainexposed indicators
const chainexposedIndicators = [
    ["MVRV", "https://chainexposed.com/XthMVRVShortTermHolderAddress.html"]
]

// Fetch all indicators
const fetchIndicators = () => {
    woochartsIndicators.forEach(([name, url]) => fetchWoocharts(name, url, storedData));
    checkonchainIndicators.forEach(([ url, indicator ]) => fetchCheckOnChain(url, indicator, storedData));
    lookintobitcoinIndicators.forEach(([ name, indicatorName, url, human_url]) => fetchLookintobitcoin(name, indicatorName, url, human_url, storedData));
    chainexposedIndicators.forEach(([ name, url ]) => fetchChainexposed(name, url, storedData));
    lastUpdated = Date.now();
}
cron.schedule('0 */1 * * *', fetchIndicators);
fetchIndicators();

// Fetch bitcoin price
let bitcoinData: storedData = {}
const fetchBitcoin = () => {
    fetchCheckOnChain('https://charts.checkonchain.com/btconchain/pricing/pricing_mayermultiple_zscore/pricing_mayermultiple_zscore_light.html', 'Price', bitcoinData);
    lastUpdated = Date.now();
}
cron.schedule('0 */1 * * *', fetchBitcoin);
fetchBitcoin();

// // Receive cryptoquant
// // Removed for security
// router.post('/cryptoquant', (req, res) => {
//     const indicators = req.body;

//     indicators.forEach(({ name, data, human_url }) => {
//         const dates = data.map(row => normalizeDate(row.date));
//         const values = data.map(row => row.value);

//         storedData[name] = {
//             name: name,
//             dates: dates,
//             values: values,
//             source: 'Cryptoquant',
//             url: human_url
//         };
        
//         console.log(`{${getTimestamp()}} Successfully processed data cryptoquant ${name}`);
//     });

//     res.status(200).json({"message": "Successfully saved data for cryptoquant!"});
// });

router.get('/lastUpdated', (req, res) => {
    res.json({ lastUpdated: lastUpdated });
});

router.get('/bitcoin', (req, res) => {
    const { startDate, endDate } = req.query;

    const dates = bitcoinData.Price.dates;
    const values = bitcoinData.Price.values;

    const filteredByStartDates = startDate ? dates.filter(date => date >= startDate) : dates; 
    const filteredDates = endDate ? filteredByStartDates.filter(date => date <= endDate) : filteredByStartDates;

    const filteredValues = filteredDates.map(date => {
        const index = dates.indexOf(date);
        return values[index];
    })

    res.json({ dates: filteredDates, values: filteredValues });
});

router.get('/', (req, res) => {
    const { startDate, endDate } = req.query;
    let dateMap: { [key: string ]: any } = {};

    for (const indicatorName in storedData) {
        const indicatorData = storedData[indicatorName];
        const values = indicatorData.values;
        const dates = indicatorData.dates;

        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
        const zScores = values.map(value => (value - mean) / stdDev);
        
        dates.forEach((date, index) => {
            if (!dateMap[date]) {
                dateMap[date] = [];
            }
            dateMap[date].push(zScores[index]);
        });
    }

    let filteredDates = Object.keys(dateMap).filter(date => {
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
    });

    let averagedData: { [key: string]: any } = {};
    filteredDates.forEach(date => {
        const zScores = dateMap[date];
        const avgZScore = zScores.reduce((acc: number, val: number) => acc + val, 0) / zScores.length;
        averagedData[date] = avgZScore;
    });

    res.json(averagedData);
});

router.get('/indicator/:name', (req, res) => {
    const indicatorName = req.params.name;
    const indicatorData = storedData[indicatorName];

    if (!indicatorData) {
        return res.status(404).json({ error: 'Indicator not found' });
    }

    const { startDate, endDate } = req.query;
    const dates = indicatorData.dates;
    const values = indicatorData.values;

    const filteredByStartDates = startDate ? dates.filter(date => date >= startDate) : dates; 
    const filteredDates = endDate ? filteredByStartDates.filter(date => date <= endDate) : filteredByStartDates;

    const filteredValues = filteredDates.map(date => {
        const index = dates.indexOf(date);
        return values[index];
    })

    const filteredIndicatorData = {
        name: indicatorData.name,
        dates: filteredDates,
        values: filteredValues,
        source: indicatorData.source,
        url: indicatorData.url
    }

    res.json(filteredIndicatorData);
});

export default router;