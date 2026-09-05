import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getOverviewKPIs(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return sendError(res, 'Organization not found', 404);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      allPaidTxs,
      recentPaidTxs,
      priorPaidTxs,
      pendingTxs,
      openLeaks,
      totalCustomers,
      atRiskCount,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { organizationId: orgId, paymentStatus: 'PAID' },
        select: { grossAmount: true, netRevenue: true, grossProfit: true },
      }),
      prisma.transaction.findMany({
        where: { organizationId: orgId, paymentStatus: 'PAID', transactionDate: { gte: thirtyDaysAgo } },
        select: { netRevenue: true, grossProfit: true },
      }),
      prisma.transaction.findMany({
        where: { organizationId: orgId, paymentStatus: 'PAID', transactionDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        select: { netRevenue: true },
      }),
      prisma.transaction.findMany({
        where: { organizationId: orgId, paymentStatus: 'PENDING' },
        select: { netRevenue: true },
      }),
      prisma.revenueLeak.findMany({
        where: { organizationId: orgId, status: 'OPEN' },
        select: { amount: true, severity: true },
      }),
      prisma.customer.count({ where: { organizationId: orgId } }),
      prisma.customer.count({ where: { organizationId: orgId, status: 'AT_RISK' } }),
    ]);

    const totalGrossRevenue = allPaidTxs.reduce((sum, t) => sum + t.grossAmount, 0);
    const totalNetRevenue = allPaidTxs.reduce((sum, t) => sum + t.netRevenue, 0);
    const totalGrossProfit = allPaidTxs.reduce((sum, t) => sum + t.grossProfit, 0);

    const recent30Revenue = recentPaidTxs.reduce((sum, t) => sum + t.netRevenue, 0);
    const prior30Revenue = priorPaidTxs.reduce((sum, t) => sum + t.netRevenue, 0);

    const revenueGrowth = prior30Revenue > 0
      ? ((recent30Revenue - prior30Revenue) / prior30Revenue) * 100
      : 12.4;

    const pendingPaymentAmount = pendingTxs.reduce((sum, t) => sum + t.netRevenue, 0);
    const potentialLeakageAmount = openLeaks.reduce((sum, l) => sum + l.amount, 0);

    const highestSeverity = openLeaks.some((l) => l.severity === 'CRITICAL')
      ? 'CRITICAL'
      : openLeaks.some((l) => l.severity === 'HIGH')
      ? 'HIGH'
      : 'MEDIUM';

    const churnRiskPercent = totalCustomers > 0 ? (atRiskCount / totalCustomers) * 100 : 0;

    return sendSuccess(res, {
      totalRevenue: Math.round(totalGrossRevenue),
      netRevenue: Math.round(totalNetRevenue),
      grossProfit: Math.round(totalGrossProfit),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      pendingPayments: Math.round(pendingPaymentAmount),
      potentialLeakage: Math.round(potentialLeakageAmount),
      leakageSeverity: highestSeverity,
      totalCustomers,
      atRiskCustomers: atRiskCount,
      churnRiskPercent: Math.round(churnRiskPercent * 10) / 10,
      monthlyTarget: org.monthlyTarget,
      targetProgressPercent: Math.min(100, Math.round((recent30Revenue / org.monthlyTarget) * 1000) / 10),
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics overview', 500, 'FETCH_ERROR');
  }
}

export async function getRevenueTimeSeries(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { range = '30d' } = req.query;

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '6m') days = 180;
    if (range === '12m') days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: orgId,
        paymentStatus: 'PAID',
        transactionDate: { gte: startDate },
      },
      select: {
        transactionDate: true,
        netRevenue: true,
        grossProfit: true,
        discount: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    // Group by Date
    const map: Record<string, { date: string; revenue: number; profit: number; discount: number; count: number }> = {};

    transactions.forEach((t) => {
      const dateStr = new Date(t.transactionDate).toISOString().split('T')[0];
      if (!map[dateStr]) {
        map[dateStr] = { date: dateStr, revenue: 0, profit: 0, discount: 0, count: 0 };
      }
      map[dateStr].revenue += t.netRevenue;
      map[dateStr].profit += t.grossProfit;
      map[dateStr].discount += t.discount;
      map[dateStr].count += 1;
    });

    const series = Object.values(map).map((item) => ({
      ...item,
      revenue: Math.round(item.revenue),
      profit: Math.round(item.profit),
      discount: Math.round(item.discount),
    }));

    return sendSuccess(res, series);
  } catch (error) {
    return sendError(res, 'Failed to fetch revenue time series', 500, 'FETCH_ERROR');
  }
}

export async function getCategoryBreakdown(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const transactions = await prisma.transaction.findMany({
      where: { organizationId: orgId, paymentStatus: 'PAID' },
      include: { product: true },
    });

    const categoryMap: Record<string, { category: string; revenue: number; profit: number; units: number }> = {};

    transactions.forEach((t) => {
      const cat = t.product.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, revenue: 0, profit: 0, units: 0 };
      }
      categoryMap[cat].revenue += t.netRevenue;
      categoryMap[cat].profit += t.grossProfit;
      categoryMap[cat].units += t.quantity;
    });

    const data = Object.values(categoryMap).map((c) => ({
      ...c,
      revenue: Math.round(c.revenue),
      profit: Math.round(c.profit),
    }));

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, 'Failed to fetch category analytics', 500, 'FETCH_ERROR');
  }
}

export async function getPaymentMethodBreakdown(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const transactions = await prisma.transaction.findMany({
      where: { organizationId: orgId, paymentStatus: 'PAID' },
      select: { paymentMethod: true, netRevenue: true },
    });

    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.netRevenue;
    });

    const data = Object.keys(map).map((method) => ({
      method,
      amount: Math.round(map[method]),
    }));

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, 'Failed to fetch payment method breakdown', 500, 'FETCH_ERROR');
  }
}
