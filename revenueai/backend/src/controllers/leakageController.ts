import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { scanAllOrganizationLeakage } from '../services/leakageEngine';
import { sendSuccess, sendError } from '../utils/response';

export async function getRevenueLeaks(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { status = 'OPEN', severity, type } = req.query;

    const where: any = { organizationId: orgId };
    if (status && status !== 'ALL') where.status = status as string;
    if (severity && severity !== 'ALL') where.severity = severity as string;
    if (type && type !== 'ALL') where.type = type as string;

    const leaks = await prisma.revenueLeak.findMany({
      where,
      orderBy: { detectedDate: 'desc' },
      include: {
        transaction: {
          include: { customer: true, product: true },
        },
      },
    });

    const totalPotentialLeakage = leaks.reduce((sum, l) => sum + l.amount, 0);

    return sendSuccess(res, {
      totalPotentialLeakage: Math.round(totalPotentialLeakage),
      count: leaks.length,
      leaks,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch revenue leaks', 500, 'FETCH_ERROR');
  }
}

export async function resolveRevenueLeak(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.revenueLeak.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Revenue leak alert not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.revenueLeak.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });

    return sendSuccess(res, updated, 'Revenue leak marked as resolved');
  } catch (error) {
    return sendError(res, 'Failed to resolve revenue leak', 500, 'UPDATE_ERROR');
  }
}

export async function scanLeakages(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const newLeaks = await scanAllOrganizationLeakage(orgId);
    return sendSuccess(res, { newLeaksDetected: newLeaks }, 'Leakage scan completed');
  } catch (error) {
    return sendError(res, 'Failed to run leakage scan', 500, 'SCAN_ERROR');
  }
}
