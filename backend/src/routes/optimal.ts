import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { parse } from 'date-fns';

const router = express.Router();
router.use(bodyParser.json());

type CsvRow = {
    Date: string;
    Close: string;
}

const readCsv = (filePath: string): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
        const results: CsvRow[] = [];
        const stream = fs.createReadStream(filePath);

        stream.on('error', (err) => {
            reject(new Error("Invalid ticker"));
        });

        stream.pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

router.post('/', async (req, res) => {
    const { ticker, start_date='2023-01-01', end_date='2024-06-19', lower_lev=0., upper_lev=5., fees=0. } = req.body as {
        ticker: string;
        start_date?: string;
        end_date?: string;
        lower_lev?: number;
        upper_lev?: number;
        fees?: number;
    };

    if (!ticker) {
        return res.status(400).json({ "error": "Ticker not provided" });
    }

    const filePath = path.join(__dirname, '..', 'data', `${ticker}-USD.csv`);

    try {
        const data = await readCsv(filePath);
        const df = data.filter(row => {
            const date = parse(row.Date, 'yyyy-MM-dd', new Date());
            return date >= new Date(start_date) && date <= new Date(end_date);
        });

        if (df.length == 0) {
            return res.status(400).json({ "error": "Invalid ticker or no data in the specified date range" });
        }

        const dates = df.map(row => row.Date);
        const closePrices = df.map(row => parseFloat(row.Close));
        const deltas = closePrices.map((price, index) => {
            if (index == 0) return null;
            return (price - closePrices[index - 1]) / closePrices[index - 1];
        }).slice(1) as number[];

        const mu = deltas.reduce((acc, val) => acc + val, 0) / deltas.length;
        const std = Math.sqrt(deltas.reduce((acc, val) => acc + Math.pow(val - mu, 2), 0) / (deltas.length - 1));

        const k = Array.from({ length: 100 }, (_, i) => lower_lev + i * (upper_lev - lower_lev) / 99);
        const R = k.map(k_i => k_i * mu - 0.5 * (k_i ** 2) * (std ** 2) / (1 + k_i * std));
        const R_fees = R.map(r_i => r_i - fees / 36500);

        const maxIndex = R.indexOf(Math.max(...R));
        const k_max = k[maxIndex];
        const R_max = R[maxIndex];

        res.status(200).json({
            "ticker": ticker,
            "k": k,
            "R": R,
            "R_fees": R_fees,
            "k_max": k_max,
            "R_max": R_max,
            "mu": mu,
            "std": std,
            "x": dates,
            "y": closePrices
        });
    } catch (err: any) {
        res.status(500).json({ "error": err.message });
    }
});

router.get('/pdf', (req, res) => {
    const filePath = path.join(__dirname, '..', 'data', 'alpha-generation-and-risk-smoothing-using-managed-volatility.pdf');
    res.sendFile(filePath, err => {
        if (err) {
            res.status(500).json({ "error": err.message });
        }
    });
});

export default router;