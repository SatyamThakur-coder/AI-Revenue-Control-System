import { Router } from 'express';
import { exportReportCSV } from '../controllers/reportController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/export', roleMiddleware(['OWNER', 'MANAGER']), exportReportCSV);

export default router;
