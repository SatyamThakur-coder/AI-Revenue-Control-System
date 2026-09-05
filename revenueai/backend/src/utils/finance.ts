export interface FinancialInput {
  quantity: number;
  unitPrice: number;
  discountInput?: number; // Could be percentage (e.g., 10 for 10%) or absolute amount
  discountIsPercentage?: boolean;
  refundAmount?: number;
  productCost: number;
  paymentStatus?: string;
}

export interface FinancialOutput {
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discount: number;
  refundAmount: number;
  netRevenue: number;
  costAmount: number;
  grossProfit: number;
  profitMargin: number;
}

export function calculateTransactionFinance(input: FinancialInput): FinancialOutput {
  const quantity = Math.max(1, Math.round(input.quantity));
  const unitPrice = Math.max(0, Number(input.unitPrice));
  const productCost = Math.max(0, Number(input.productCost));

  const grossAmount = Math.round(quantity * unitPrice * 100) / 100;

  let discount = 0;
  if (input.discountInput && input.discountInput > 0) {
    if (input.discountIsPercentage) {
      discount = (grossAmount * Math.min(100, input.discountInput)) / 100;
    } else {
      discount = Math.min(grossAmount, input.discountInput);
    }
  }
  discount = Math.round(discount * 100) / 100;

  let refundAmount = 0;
  if (input.refundAmount && input.refundAmount > 0) {
    refundAmount = Math.min(grossAmount - discount, input.refundAmount);
  }
  refundAmount = Math.round(refundAmount * 100) / 100;

  // Failed payment results in 0 net revenue collected
  let netRevenue = 0;
  if (input.paymentStatus !== 'FAILED') {
    netRevenue = Math.max(0, grossAmount - discount - refundAmount);
  }
  netRevenue = Math.round(netRevenue * 100) / 100;

  const costAmount = Math.round(quantity * productCost * 100) / 100;
  const grossProfit = Math.round((netRevenue - costAmount) * 100) / 100;

  let profitMargin = 0;
  if (netRevenue > 0) {
    profitMargin = Math.round((grossProfit / netRevenue) * 10000) / 100;
  }

  return {
    quantity,
    unitPrice,
    grossAmount,
    discount,
    refundAmount,
    netRevenue,
    costAmount,
    grossProfit,
    profitMargin,
  };
}
