import { Router } from 'express';
import { getTransactions, createTransaction, getTransactionById, deleteTransaction } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getTransactions);
router.post('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), createTransaction);
router.get('/:id', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getTransactionById);
router.delete('/:id', roleMiddleware(['OWNER', 'MANAGER']), deleteTransaction);

export default router;
