const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Increase limit for POST /api/valuation/cryptoquant
app.use(bodyParser.json({limit: '200mb'}));

const getTimestamp = () => {
    return new Date().toUTCString();
};

// Add CORS
app.use(cors());

// Serve static files for React frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Prepend /api to all routes
app.use('/api', require('./routes/api'))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
})

app.listen(port, () => {
    console.log(`[${getTimestamp()}] Server is running on http://localhost:${port}`);
});
