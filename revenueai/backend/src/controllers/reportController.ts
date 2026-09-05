import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { sendError } from '../utils/response';

export async function exportReportCSV(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { type = 'revenue' } = req.query;

    let filename = `revenueai_${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    let csvHeader = '';
    let csvRows: string[] = [];

    if (type === 'revenue' || type === 'transactions') {
      const txs = await prisma.transaction.findMany({
        where: { organizationId: orgId },
        include: { customer: true, product: true },
        orderBy: { transactionDate: 'desc' },
      });

      csvHeader = 'Transaction ID,Date,Customer,Product,Quantity,Unit Price,Gross Amount,Discount,Tax,Refund,Net Revenue,Profit,Margin %,Payment Status,Payment Method';
      csvRows = txs.map((t) => [
        t.id,
        new Date(t.transactionDate).toISOString().split('T')[0],
        `"${t.customer.name.replace(/"/g, '""')}"`,
        `"${t.product.name.replace(/"/g, '""')}"`,
        t.quantity,
        t.unitPrice,
        t.grossAmount,
        t.discount,
        t.tax,
        t.refundAmount,
        t.netRevenue,
        t.grossProfit,
        t.profitMargin,
        t.paymentStatus,
        t.paymentMethod,
      ].join(','));

    } else if (type === 'customers') {
      const customers = await prisma.customer.findMany({
        where: { organizationId: orgId },
        orderBy: { totalRevenue: 'desc' },
      });

      csvHeader = 'Customer ID,Name,Email,Phone,Location,Status,Total Revenue,Last Purchase Date,Customer Since';
      csvRows = customers.map((c) => [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        c.email,
        c.phone || '',
        `"${(c.location || '').replace(/"/g, '""')}"`,
        c.status,
        c.totalRevenue,
        c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toISOString().split('T')[0] : '',
        new Date(c.customerSince).toISOString().split('T')[0],
      ].join(','));

    } else if (type === 'products') {
      const products = await prisma.product.findMany({
        where: { organizationId: orgId },
        include: { transactions: { where: { paymentStatus: 'PAID' } } },
      });

      csvHeader = 'Product ID,Name,Category,Price,Cost,Stock,Total Revenue,Total Profit,Units Sold';
      csvRows = products.map((p) => {
        const rev = p.transactions.reduce((sum, t) => sum + t.netRevenue, 0);
        const profit = p.transactions.reduce((sum, t) => sum + t.grossProfit, 0);
        const units = p.transactions.reduce((sum, t) => sum + t.quantity, 0);
        return [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.category.replace(/"/g, '""')}"`,
          p.price,
          p.cost,
          p.stock,
          rev,
          profit,
          units,
        ].join(',');
      });

    } else if (type === 'leakage') {
      const leaks = await prisma.revenueLeak.findMany({
        where: { organizationId: orgId },
        orderBy: { detectedDate: 'desc' },
      });

      csvHeader = 'Leak ID,Type,Amount,Severity,Description,Status,Detected Date';
      csvRows = leaks.map((l) => [
        l.id,
        l.type,
        l.amount,
        l.severity,
        `"${l.description.replace(/"/g, '""')}"`,
        l.status,
        new Date(l.detectedDate).toISOString().split('T')[0],
      ].join(','));

    } else {
      return sendError(res, 'Invalid report type requested', 400, 'INVALID_REPORT_TYPE');
    }

    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return sendError(res, 'Failed to export report CSV', 500, 'EXPORT_ERROR');
  }
}
