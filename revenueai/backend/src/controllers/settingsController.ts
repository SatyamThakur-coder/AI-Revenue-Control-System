import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getOrganizationSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const [org, teamMembers, targets] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId } }),
      prisma.user.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.revenueTarget.findMany({
        where: { organizationId: orgId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 12,
      }),
    ]);

    if (!org) {
      return sendError(res, 'Organization not found', 404);
    }

    return sendSuccess(res, {
      organization: org,
      teamMembers,
      targets,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch settings', 500, 'FETCH_ERROR');
  }
}

export async function updateMonthlyTarget(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { monthlyTarget } = req.body;

    if (typeof monthlyTarget !== 'number' || monthlyTarget <= 0) {
      return sendError(res, 'Target amount must be a positive number', 400, 'INVALID_TARGET');
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { monthlyTarget },
    });

    const now = new Date();
    await prisma.revenueTarget.upsert({
      where: {
        organizationId_year_month: {
          organizationId: orgId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      update: { targetAmount: monthlyTarget },
      create: {
        organizationId: orgId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        targetAmount: monthlyTarget,
      },
    });

    return sendSuccess(res, updatedOrg, 'Monthly target updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update monthly target', 500, 'UPDATE_ERROR');
  }
}
