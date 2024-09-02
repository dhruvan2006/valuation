import { Router } from 'express';

import leverageRoutes from './leverage';
import optimalRoutes from './optimal';
import valuationRoutes from './valuation';

const router = Router();

// Routes for /api/leverage
router.use('/leverage', leverageRoutes);

// Routes for /api/optimal
router.use('/optimal', optimalRoutes);

//  Routes for /api/valuation
router.use('/valuation', valuationRoutes);

export default router;