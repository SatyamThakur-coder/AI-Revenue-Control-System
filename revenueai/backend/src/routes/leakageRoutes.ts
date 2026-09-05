import { Router } from 'express';
import { getRevenueLeaks, resolveRevenueLeak, scanLeakages } from '../controllers/leakageController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getRevenueLeaks);
router.post('/scan', roleMiddleware(['OWNER', 'MANAGER']), scanLeakages);
router.put('/:id/resolve', roleMiddleware(['OWNER', 'MANAGER']), resolveRevenueLeak);

export default router;
