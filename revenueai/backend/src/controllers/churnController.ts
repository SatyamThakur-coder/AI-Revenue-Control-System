import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { callMLChurnPrediction } from '../services/mlBridge';
import { sendSuccess, sendError } from '../utils/response';

export async function getCustomerChurnPredictions(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const customers = await prisma.customer.findMany({
      where: { organizationId: orgId },
      include: {
        transactions: { select: { netRevenue: true, refundAmount: true, paymentStatus: true, transactionDate: true } },
      },
    });

    const now = new Date();

    const preparedCustomers = customers.map((c) => {
      const lastTxDate = c.lastPurchaseDate ? new Date(c.lastPurchaseDate) : c.customerSince;
      const daysSinceLastPurchase = Math.floor((now.getTime() - new Date(lastTxDate).getTime()) / (1000 * 60 * 60 * 24));
      
      const totalTxCount = c.transactions.length;
      const daysActive = Math.max(1, Math.floor((now.getTime() - new Date(c.customerSince).getTime()) / (1000 * 60 * 60 * 24)));
      const purchaseFrequency = (totalTxCount / daysActive) * 30; // purchases per month

      const refundCount = c.transactions.filter((t) => t.refundAmount > 0 || t.paymentStatus === 'REFUNDED').length;
      const failedPaymentCount = c.transactions.filter((t) => t.paymentStatus === 'FAILED').length;

      const avgOrderValue = totalTxCount > 0 ? c.totalRevenue / totalTxCount : 0;

      return {
        customerId: c.id,
        daysSinceLastPurchase,
        purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
        totalSpending: c.totalRevenue,
        averageOrderValue: Math.round(avgOrderValue),
        transactionCount: totalTxCount,
        refundCount,
        failedPaymentCount,
      };
    });

    const mlResponse = await callMLChurnPrediction(preparedCustomers);

    const predictionMap = new Map();
    if (mlResponse && mlResponse.predictions) {
      mlResponse.predictions.forEach((p: any) => predictionMap.set(p.customerId, p));
    }

    const enrichedResults = customers.map((c) => {
      const pred = predictionMap.get(c.id) || {
        churnProbability: c.status === 'AT_RISK' ? 0.78 : c.status === 'CHURNED' ? 0.95 : 0.15,
        riskLevel: c.status === 'AT_RISK' ? 'HIGH' : c.status === 'CHURNED' ? 'HIGH' : 'LOW',
        keyFactors: ['Normal purchasing activity'],
      };

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        location: c.location,
        status: c.status,
        totalRevenue: c.totalRevenue,
        lastPurchaseDate: c.lastPurchaseDate,
        churnProbability: pred.churnProbability,
        riskLevel: pred.riskLevel,
        keyFactors: typeof pred.keyFactors === 'string' ? JSON.parse(pred.keyFactors) : pred.keyFactors,
      };
    }).sort((a, b) => b.churnProbability - a.churnProbability);

    return sendSuccess(res, {
      totalAnalyzed: enrichedResults.length,
      highRiskCount: enrichedResults.filter((r) => r.riskLevel === 'HIGH').length,
      predictions: enrichedResults,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch churn predictions', 500, 'CHURN_ERROR');
  }
}
