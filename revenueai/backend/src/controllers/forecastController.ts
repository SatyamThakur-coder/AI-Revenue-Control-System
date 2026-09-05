import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { callMLRevenueForecast } from '../services/mlBridge';
import { sendSuccess, sendError } from '../utils/response';

export async function getRevenueForecast(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    // Fetch daily aggregated historical transactions
    const transactions = await prisma.transaction.findMany({
      where: { organizationId: orgId, paymentStatus: 'PAID' },
      select: { transactionDate: true, netRevenue: true },
      orderBy: { transactionDate: 'asc' },
    });

    const dateMap: Record<string, { date: string; revenue: number; count: number }> = {};
    transactions.forEach((t) => {
      const dateStr = new Date(t.transactionDate).toISOString().split('T')[0];
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, revenue: 0, count: 0 };
      }
      dateMap[dateStr].revenue += t.netRevenue;
      dateMap[dateStr].count += 1;
    });

    const historicalData = Object.values(dateMap).map((d) => ({
      date: d.date,
      revenue: Math.round(d.revenue),
      transactionCount: d.count,
    }));

    // Data Sufficiency Check: Requires at least 30 distinct days of historical data
    if (historicalData.length < 30) {
      return sendSuccess(res, {
        sufficientData: false,
        daysAvailable: historicalData.length,
        requiredDays: 30,
        message: 'Not enough historical data. Revenue forecasting requires at least 30 days of transaction history.',
        historicalData,
        predictions: [],
      });
    }

    const forecastResult = await callMLRevenueForecast(historicalData);

    return sendSuccess(res, {
      sufficientData: true,
      daysAvailable: historicalData.length,
      historicalData: historicalData.slice(-60), // return last 60 days of historical context
      ...forecastResult,
    });
  } catch (error) {
    return sendError(res, 'Failed to generate revenue forecast', 500, 'FORECAST_ERROR');
  }
}
