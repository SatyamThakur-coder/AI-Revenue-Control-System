import { Router } from 'express';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import productRoutes from './productRoutes';
import transactionRoutes from './transactionRoutes';
import analyticsRoutes from './analyticsRoutes';
import leakageRoutes from './leakageRoutes';
import forecastRoutes from './forecastRoutes';
import churnRoutes from './churnRoutes';
import aiRoutes from './aiRoutes';
import reportRoutes from './reportRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/leakage', leakageRoutes);
router.use('/forecast', forecastRoutes);
router.use('/churn', churnRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

export default router;
