import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';

import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 5000;

// Increase limit for POST /api/valuation/cryptoquant
app.use(bodyParser.json({limit: '200mb'}));

export const getTimestamp = () => {
    return new Date().toUTCString();
};

// Add CORS
app.use(cors());

// Serve static files for React frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Prepend /api to all routes
app.use('/api', apiRoutes);

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
})

app.listen(port, () => {
    console.log(`[${getTimestamp()}] Server is running on http://localhost:${port}`);
});
