const express = require('express');
const router = express.Router();

// Routes for /api/leverage
router.use('/leverage', require('./leverage'));

// Routes for /api/optimal
router.use('/optimal', require('./optimal'));

//  Routes for /api/valuation
router.use('/valuation', require('./valuation'));

module.exports = router;