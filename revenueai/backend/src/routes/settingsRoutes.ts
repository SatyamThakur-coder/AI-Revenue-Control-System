import { Router } from 'express';
import { getOrganizationSettings, updateMonthlyTarget } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getOrganizationSettings);
router.put('/target', roleMiddleware(['OWNER']), updateMonthlyTarget);

export default router;
