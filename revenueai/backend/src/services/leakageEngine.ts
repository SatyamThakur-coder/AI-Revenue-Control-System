import { prisma } from '../db/prisma';

export async function evaluateTransactionLeakage(transactionId: string, organizationId: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { product: true, customer: true },
  });

  if (!tx || tx.organizationId !== organizationId) return;

  const leaksToCreate = [];

  // 1. Excessive discounts (> 25% discount)
  if (tx.discount > tx.grossAmount * 0.25) {
    const discPct = Math.round((tx.discount / tx.grossAmount) * 100);
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'EXCESSIVE_DISCOUNT',
      amount: tx.discount,
      severity: discPct > 40 ? 'CRITICAL' : 'HIGH',
      description: `Potential revenue leak of ₹${tx.discount.toLocaleString()} detected: Excessive discount (${discPct}%) applied on transaction #${tx.id.slice(0, 8)}.`,
    });
  }

  // 2. Failed payments
  if (tx.paymentStatus === 'FAILED') {
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'FAILED_PAYMENT',
      amount: tx.grossAmount,
      severity: 'CRITICAL',
      description: `Potential revenue leak of ₹${tx.grossAmount.toLocaleString()} detected: Uncollected transaction revenue due to payment failure.`,
    });
  }

  // 3. Duplicate transactions (Same customer, product, and amount within 10 minutes)
  const tenMinutesAgo = new Date(new Date(tx.transactionDate).getTime() - 10 * 60 * 1000);
  const tenMinutesAfter = new Date(new Date(tx.transactionDate).getTime() + 10 * 60 * 1000);

  const duplicateCount = await prisma.transaction.count({
    where: {
      organizationId,
      customerId: tx.customerId,
      productId: tx.productId,
      grossAmount: tx.grossAmount,
      id: { not: tx.id },
      transactionDate: {
        gte: tenMinutesAgo,
        lte: tenMinutesAfter,
      },
    },
  });

  if (duplicateCount > 0) {
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'DUPLICATE_TRANSACTION',
      amount: tx.grossAmount,
      severity: 'HIGH',
      description: `Potential revenue leak of ₹${tx.grossAmount.toLocaleString()} detected: Duplicate transaction flagged within 10-minute window for ${tx.customer.name}.`,
    });
  }

  // 4. Pricing anomalies (unitPrice < product cost or unitPrice > 2x MSRP)
  if (tx.unitPrice < tx.product.cost) {
    const marginDeficit = (tx.product.cost - tx.unitPrice) * tx.quantity;
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'PRICING_ANOMALY',
      amount: marginDeficit,
      severity: 'CRITICAL',
      description: `Potential revenue leak of ₹${marginDeficit.toLocaleString()} detected: Unit price (₹${tx.unitPrice}) was sold below unit cost (₹${tx.product.cost}).`,
    });
  }

  // 5. Refund anomalies (Refund > 50% order value)
  if (tx.refundAmount > tx.grossAmount * 0.5) {
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'REFUND_ANOMALY',
      amount: tx.refundAmount,
      severity: 'HIGH',
      description: `Potential revenue leak of ₹${tx.refundAmount.toLocaleString()} detected: High refund amount (${Math.round((tx.refundAmount / tx.grossAmount) * 100)}% of gross amount).`,
    });
  }

  // 6. Low margin transactions (< 8% profit margin)
  if (tx.profitMargin < 8 && tx.paymentStatus === 'PAID' && tx.profitMargin >= 0) {
    leaksToCreate.push({
      organizationId,
      transactionId: tx.id,
      type: 'LOW_MARGIN',
      amount: Math.round(tx.costAmount * 0.1),
      severity: 'MEDIUM',
      description: `Potential revenue leak detected: Transaction margin of ${tx.profitMargin.toFixed(1)}% is below healthy target margin.`,
    });
  }

  for (const leak of leaksToCreate) {
    await prisma.revenueLeak.create({
      data: leak,
    });
  }

  return leaksToCreate.length;
}

export async function scanAllOrganizationLeakage(organizationId: string) {
  // Scans pending payments > 14 days old
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const pendingTxs = await prisma.transaction.findMany({
    where: {
      organizationId,
      paymentStatus: 'PENDING',
      transactionDate: { lte: fourteenDaysAgo },
    },
  });

  let newLeakCount = 0;
  for (const pTx of pendingTxs) {
    const existing = await prisma.revenueLeak.findFirst({
      where: { organizationId, transactionId: pTx.id, type: 'MISSING_PAYMENT' },
    });
    if (!existing) {
      await prisma.revenueLeak.create({
        data: {
          organizationId,
          transactionId: pTx.id,
          type: 'MISSING_PAYMENT',
          amount: pTx.netRevenue,
          severity: 'HIGH',
          description: `Potential revenue leak of ₹${pTx.netRevenue.toLocaleString()} detected: Payment pending for over 14 days.`,
        },
      });
      newLeakCount++;
    }
  }
  return newLeakCount;
}
