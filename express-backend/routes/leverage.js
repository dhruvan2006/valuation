const express = require('express');
const cron = require('node-cron');
const axios = require('axios');

const router = express.Router();

let lastUpdated = Date.now();

const getTimestamp = () => {
    return new Date().toUTCString();
};

// -------------------------- Start TLX --------------------------
const tlx = {
    'ETH1L': '0xda08D59CaAdF87c59D56101670B5e023A0593B34',
    'ETH2L': '0x46A0277d53274cAfbb089e9870d2448e4224dAD9',
    'ETH3L': '0xC013551A4c84BBcec4f75DBb8a45a444E2E9bbe7',
    'ETH4L': '0x330cA3de269282fD456dB203046d500633D68F11',
    'ETH5L': '0x0b79C19c4929B2FA2CFb4c8ad7649c03cde00Efa',

    'BTC1L': '0x169d4884be225b322963912Df3641948143FF92B',
    'BTC2L': '0xc1422a15de4B7ED22EEedaEA2a4276De542C7a77',
    'BTC3L': '0x54cC16d2c91F6fa0a30d4C22868459085A7CE4d9',
    'BTC4L': '0xCb9fB365f52BF2e49f7e76b7E8dd3e068171D136',
    'BTC5L': '0x8efd20F6313eB0bc61908b3eB95368BE442A149d',

    'SOL1L': '0x09C2774DC4658D367162bE0bf8226F14bE4F52e6',
    'SOL2L': '0x94cC3a994Af812628Fa50f0a4ABe1E2085618Fb8',
    'SOL3L': '0xe4DA85B92aE54ebF736EB51f0E962859454662fa',
    'SOL4L': '0xA2D72bEeF65dC3544446B3C710a0E1Fa1778e55d',
    'SOL5L': '0xCf81EcA92Fc32F3a1EcFC1c7f5Ab6bCF59795278',
}

let tlxData = {};

const fetchTlx = async () => {
    for (const asset in tlx) {
        try {
            const response = await axios.get(`https://api.tlx.fi/functions/v1/prices/${tlx[asset]}?granularity=24hours&from=1990-01-01T00:00:00.000Z`);
            tlxData[asset] = response.data;
            console.log(`[${getTimestamp()}] Fetched data for TLX ${asset}`);
            lastUpdated = Date.now();
        } catch (error) {
            console.error(`[${getTimestamp()}] Error fetching data for TLX ${asset}:`, error);
        }
    }
}

cron.schedule('0 */1 * * *', fetchTlx);

fetchTlx();
// -------------------------- End TLX --------------------------


// -------------------------- Start Toros --------------------------
const toros = {
    'ARB:ETHBULL3X': '0xf715724abba480d4d45f4cb52bef5ce5e3513ccc',
    'MATIC:ETHBULL3X': '0x32b1d1bfd4b3b0cb9ff2dcd9dac757aa64d4cb69',
    'OP:ETHBULL3X': '0x32b1d1bfd4b3b0cb9ff2dcd9dac757aa64d4cb69',
    'OP:ETHBULL2X': '0x9573c7b691cdcebbfa9d655181f291799dfb7cf5',

    'ARB:BTCBULL3X': '0xad38255febd566809ae387d5be66ecd287947cb9',
    'MATIC:BTCBULL3X': '0xdb88ab5b485b38edbeef866314f9e49d095bce39',
    'OP:BTCBULL4x': '0x11b55966527ff030ca9c7b1c548b4be5e7eaee6d',
    'OP:BTCBULL3X': '0xb03818de4992388260b62259361778cf98485dfe',
    'OP:BTCBULL2X': '0x32ad28356ef70adc3ec051d8aacdeeaa10135296',

    'OP:SOLBULL3X': '0xcc7d6ed524760539311ed0cdb41d0852b4eb77eb',
    'OP:SOLLBULL2X': '0x7d3c9c6566375d7ad6e89169ca5c01b5edc15364',
}

let torosData = {}

const fetchToros = async () => {
    for (const asset in toros) {
        try {
            const payload = {
                "query": "query GetTokenPriceCandles($address: String!, $period: String!, $interval: String) {\n  tokenPriceCandles(address: $address, period: $period, interval: $interval) {\n    timestamp\n    open\n    close\n    max\n    min\n  }\n}\n",
                "variables": {
                    "address": toros[asset],
                    "period": "3m",
                    "interval": "1d"
                },
                "operationName": "GetTokenPriceCandles"
            }
            const response = await axios.post('https://api-v2.dhedge.org/graphql', payload);
            const candles = response.data['data']['tokenPriceCandles'];
            const data = [];
            for (const candle of candles) {
                data.push({
                    "timestamp": new Date(parseInt(candle.timestamp)),
                    "price": parseFloat(candle.close) / 1e18,
                })
            }
            torosData[asset] = data;
            console.log(`[${getTimestamp()}] Fetched data for Toros ${asset}`);
            lastUpdated = Date.now();
        } catch (error) {
            console.error(`[${getTimestamp()}] Error fetching data for Toros ${asset}:`, error);
        }
    }
}

cron.schedule('0 */1 * * *', fetchToros);

fetchToros();
// -------------------------- End Toros --------------------------

router.get('/lastUpdated', (req, res) => {
    res.json({"lastUpdated": lastUpdated});
});

// Routes for /api/leverage/tlx
router.get('/tlx/asset/:type', (req, res) => {
    const assetType = req.params.type;
    const data = tlxData[assetType];

    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Asset not found' });
    }
});

// Routes for /api/leverage/toros
router.get('/toros/asset/:type', (req, res) => {
    const assetType = req.params.type;
    const data = torosData[assetType];

    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Asset not found' });
    }
});

module.exports = router;