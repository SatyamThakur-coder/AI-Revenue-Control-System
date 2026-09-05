import { Router } from 'express';
import { getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getCustomers);
router.post('/', roleMiddleware(['OWNER', 'MANAGER']), createCustomer);
router.get('/:id', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getCustomerById);
router.put('/:id', roleMiddleware(['OWNER', 'MANAGER']), updateCustomer);
router.delete('/:id', roleMiddleware(['OWNER']), deleteCustomer);

export default router;
