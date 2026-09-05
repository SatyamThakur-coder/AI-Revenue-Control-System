import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'AT_RISK', 'CHURNED', 'VIP', 'NEW']).optional(),
});

export async function getCustomers(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { search, status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { organizationId: orgId };

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { location: { contains: search as string } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { transactions: true } },
          churnPredictions: { take: 1, orderBy: { predictedDate: 'desc' } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return sendSuccess(res, {
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch customers', 500, 'FETCH_ERROR');
  }
}

export async function createCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const parse = customerSchema.safeParse(req.body);
    if (!parse.success) {
      return sendError(res, 'Invalid customer input', 400, 'VALIDATION_ERROR', parse.error.format());
    }

    const customer = await prisma.customer.create({
      data: {
        ...parse.data,
        organizationId: orgId,
      },
    });

    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create customer', 500, 'CREATE_ERROR');
  }
}

export async function getCustomerById(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          include: { product: true },
        },
        churnPredictions: { orderBy: { predictedDate: 'desc' } },
      },
    });

    if (!customer) {
      return sendError(res, 'Customer not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, customer);
  } catch (error) {
    return sendError(res, 'Failed to fetch customer profile', 500, 'FETCH_ERROR');
  }
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Customer not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, updated, 'Customer updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update customer', 500, 'UPDATE_ERROR');
  }
}

export async function deleteCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Customer not found', 404, 'NOT_FOUND');
    }

    await prisma.customer.delete({ where: { id } });
    return sendSuccess(res, null, 'Customer deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete customer', 500, 'DELETE_ERROR');
  }
}
