import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
});

export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { category, search } = req.query;

    const where: any = { organizationId: orgId };
    if (category && category !== 'ALL') {
      where.category = category as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { category: { contains: search as string } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        transactions: {
          select: {
            quantity: true,
            grossAmount: true,
            netRevenue: true,
            grossProfit: true,
            refundAmount: true,
            paymentStatus: true,
            customerId: true,
          },
        },
      },
    });

    const enrichedProducts = products.map((p) => {
      const paidTxs = p.transactions.filter((t) => t.paymentStatus === 'PAID');
      const allTxs = p.transactions;

      const totalRevenue = paidTxs.reduce((sum, t) => sum + t.netRevenue, 0);
      const totalProfit = paidTxs.reduce((sum, t) => sum + t.grossProfit, 0);
      const unitsSold = paidTxs.reduce((sum, t) => sum + t.quantity, 0);
      const refundCount = allTxs.filter((t) => t.refundAmount > 0 || t.paymentStatus === 'REFUNDED').length;
      const refundRate = allTxs.length > 0 ? (refundCount / allTxs.length) * 100 : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const uniqueCustomers = new Set(paidTxs.map((t) => t.customerId)).size;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        active: p.active,
        createdAt: p.createdAt,
        analytics: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalProfit: Math.round(totalProfit * 100) / 100,
          unitsSold,
          profitMargin: Math.round(profitMargin * 10) / 10,
          refundRate: Math.round(refundRate * 10) / 10,
          customerCount: uniqueCustomers,
        },
      };
    });

    return sendSuccess(res, enrichedProducts);
  } catch (error) {
    return sendError(res, 'Failed to fetch products', 500, 'FETCH_ERROR');
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const parse = productSchema.safeParse(req.body);
    if (!parse.success) {
      return sendError(res, 'Invalid product input', 400, 'VALIDATION_ERROR', parse.error.format());
    }

    const product = await prisma.product.create({
      data: {
        ...parse.data,
        organizationId: orgId,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create product', 500, 'CREATE_ERROR');
  }
}

export async function getProductById(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const product = await prisma.product.findFirst({
      where: { id, organizationId: orgId },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 50,
          include: { customer: true },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, product);
  } catch (error) {
    return sendError(res, 'Failed to fetch product', 500, 'FETCH_ERROR');
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.product.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Product not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update product', 500, 'UPDATE_ERROR');
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.product.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Product not found', 404, 'NOT_FOUND');
    }

    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete product', 500, 'DELETE_ERROR');
  }
}
