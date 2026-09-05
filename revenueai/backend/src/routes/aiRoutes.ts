import { Router } from 'express';
import { handleAIChat, getAIRecommendations, updateAIRecommendationStatus } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenant';
import { roleMiddleware } from '../middleware/roles';

const router = Router();

router.use(authMiddleware, tenantIsolation);

router.post('/chat', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), handleAIChat);
router.get('/recommendations', roleMiddleware(['OWNER', 'MANAGER', 'STAFF']), getAIRecommendations);
router.put('/recommendations/:id/status', roleMiddleware(['OWNER', 'MANAGER']), updateAIRecommendationStatus);

export default router;
