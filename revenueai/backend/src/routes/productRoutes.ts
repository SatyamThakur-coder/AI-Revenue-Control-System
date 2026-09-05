import { Router } from 'express';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getProducts);
router.post('/', roleMiddleware(['OWNER', 'MANAGER']), createProduct);
router.get('/:id', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getProductById);
router.put('/:id', roleMiddleware(['OWNER', 'MANAGER']), updateProduct);
router.delete('/:id', roleMiddleware(['OWNER']), deleteProduct);

export default router;
