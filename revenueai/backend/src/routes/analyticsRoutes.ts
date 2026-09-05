import { Router } from 'express';
import { getOverviewKPIs, getRevenueTimeSeries, getCategoryBreakdown, getPaymentMethodBreakdown } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/overview', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getOverviewKPIs);
router.get('/revenue', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getRevenueTimeSeries);
router.get('/profit', roleMiddleware(['OWNER', 'MANAGER']), getCategoryBreakdown);
router.get('/products', roleMiddleware(['OWNER', 'MANAGER']), getCategoryBreakdown);
router.get('/payment-methods', roleMiddleware(['OWNER', 'MANAGER']), getPaymentMethodBreakdown);

export default router;
