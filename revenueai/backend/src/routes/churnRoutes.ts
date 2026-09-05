import { Router } from 'express';
import { getCustomerChurnPredictions } from '../controllers/churnController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER']), getCustomerChurnPredictions);

export default router;
