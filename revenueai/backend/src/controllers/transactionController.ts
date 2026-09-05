import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { calculateTransactionFinance } from '../utils/finance';
import { evaluateTransactionLeakage } from '../services/leakageEngine';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const createTransactionSchema = z.object({
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  discountIsPercentage: z.boolean().optional(),
  refundAmount: z.number().nonnegative().optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']).optional(),
  transactionDate: z.string().optional(),
});

export async function getTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { search, paymentStatus, paymentMethod, customerId, productId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { organizationId: orgId };

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus as string;
    }
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as string;
    }
    if (customerId) where.customerId = customerId as string;
    if (productId) where.productId = productId as string;

    if (search) {
      where.OR = [
        { customer: { name: { contains: search as string } } },
        { product: { name: { contains: search as string } } },
        { id: { contains: search as string } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { transactionDate: 'desc' },
        include: {
          customer: true,
          product: true,
          revenueLeaks: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return sendSuccess(res, {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch transactions', 500, 'FETCH_ERROR');
  }
}

export async function createTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const userId = req.user!.userId;

    const parse = createTransactionSchema.safeParse(req.body);
    if (!parse.success) {
      return sendError(res, 'Invalid transaction input', 400, 'VALIDATION_ERROR', parse.error.format());
    }

    const { customerId, productId, quantity, discount, discountIsPercentage, refundAmount, paymentStatus, paymentMethod, transactionDate } = parse.data;

    const [customer, product] = await Promise.all([
      prisma.customer.findFirst({ where: { id: customerId, organizationId: orgId } }),
      prisma.product.findFirst({ where: { id: productId, organizationId: orgId } }),
    ]);

    if (!customer || !product) {
      return sendError(res, 'Invalid customer or product selected for this organization', 400, 'INVALID_REFERENCE');
    }

    const unitPrice = parse.data.unitPrice !== undefined ? parse.data.unitPrice : product.price;

    const finance = calculateTransactionFinance({
      quantity,
      unitPrice,
      discountInput: discount,
      discountIsPercentage: discountIsPercentage ?? false,
      refundAmount: refundAmount ?? 0,
      productCost: product.cost,
      paymentStatus: paymentStatus ?? 'PAID',
    });

    const txDate = transactionDate ? new Date(transactionDate) : new Date();

    const transaction = await prisma.transaction.create({
      data: {
        organizationId: orgId,
        customerId,
        productId,
        salespersonId: userId,
        quantity: finance.quantity,
        unitPrice: finance.unitPrice,
        grossAmount: finance.grossAmount,
        discount: finance.discount,
        tax: Math.round(finance.grossAmount * 0.08 * 100) / 100,
        refundAmount: finance.refundAmount,
        netRevenue: finance.netRevenue,
        costAmount: finance.costAmount,
        grossProfit: finance.grossProfit,
        profitMargin: finance.profitMargin,
        paymentStatus: paymentStatus ?? 'PAID',
        paymentMethod: paymentMethod ?? 'CARD',
        transactionDate: txDate,
      },
      include: { customer: true, product: true },
    });

    if (paymentStatus === 'PAID' || paymentStatus === undefined) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalRevenue: { increment: finance.netRevenue },
          lastPurchaseDate: txDate,
          status: customer.status === 'NEW' ? 'ACTIVE' : customer.status,
        },
      });
    }

    await evaluateTransactionLeakage(transaction.id, orgId);

    return sendSuccess(res, transaction, 'Transaction recorded successfully', 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    return sendError(res, 'Failed to record transaction', 500, 'CREATE_ERROR');
  }
}

export async function getTransactionById(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const transaction = await prisma.transaction.findFirst({
      where: { id, organizationId: orgId },
      include: { customer: true, product: true, revenueLeaks: true },
    });

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, transaction);
  } catch (error) {
    return sendError(res, 'Failed to fetch transaction', 500, 'FETCH_ERROR');
  }
}

export async function deleteTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;

    const existing = await prisma.transaction.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
    }

    await prisma.transaction.delete({ where: { id } });
    return sendSuccess(res, null, 'Transaction deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete transaction', 500, 'DELETE_ERROR');
  }
}
