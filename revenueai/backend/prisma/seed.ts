import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RevenueAI database seed...');

  // Clean existing database
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.churnPrediction.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.revenueLeak.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.revenueTarget.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🧹 Cleaned existing database tables');

  // 1. Create Demo Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Revenue Corp',
      businessType: 'B2B SaaS & Enterprise Services',
      monthlyTarget: 2500000.0, // ₹25,00,000
    },
  });
  console.log(`✅ Created Organization: ${org.name} (${org.id})`);

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const owner = await prisma.user.create({
    data: {
      name: 'Alex Vance (Owner)',
      email: 'demo@revenueai.com',
      password: hashedPassword,
      role: 'OWNER',
      organizationId: org.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Manager)',
      email: 'manager@revenueai.com',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: org.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'David Miller (Staff)',
      email: 'staff@revenueai.com',
      password: hashedPassword,
      role: 'STAFF',
      organizationId: org.id,
    },
  });

  console.log(`✅ Created 3 Users (Owner: demo@revenueai.com, Manager, Staff)`);

  // 3. Create 50 Products across 5 categories
  const categories = [
    'Cloud Subscriptions',
    'Enterprise Software',
    'Consulting & Support',
    'Hardware & Edge Nodes',
    'API & Data Pipelines',
  ];

  const productDataList = [];
  let prodCounter = 1;

  for (const cat of categories) {
    for (let i = 1; i <= 10; i++) {
      const basePrice = Math.floor(Math.random() * 4500) + 500; // 500 to 5000
      const costMargin = 0.2 + Math.random() * 0.35; // 20% - 55% cost ratio
      const cost = Math.round(basePrice * costMargin);
      productDataList.push({
        organizationId: org.id,
        name: `${cat.slice(0, 4).toUpperCase()}-${100 + prodCounter} ${cat.split(' ')[0]} Tier ${i}`,
        category: cat,
        description: `High performance ${cat} solution for growing enterprise teams. Tier level ${i}.`,
        price: basePrice,
        cost: cost,
        stock: Math.floor(Math.random() * 500) + 50,
        active: true,
      });
      prodCounter++;
    }
  }

  await prisma.product.createMany({
    data: productDataList,
  });

  const products = await prisma.product.findMany({ where: { organizationId: org.id } });
  console.log(`✅ Created ${products.length} Products`);

  // 4. Create 500 Customers with realistic status distribution
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'London, UK',
    'Bengaluru, India', 'Mumbai, India', 'Singapore', 'Berlin, Germany', 'Toronto, Canada',
    'Sydney, Australia', 'Tokyo, Japan', 'Chicago, IL', 'Boston, MA', 'Dublin, Ireland'
  ];

  const companyPrefixes = [
    'Apex', 'Nexus', 'Vertex', 'Synergy', 'Vanguard', 'Starlight', 'Hyperion', 'Quantum',
    'Zenith', 'Pulse', 'Aether', 'Cobalt', 'Velocity', 'Orbit', 'Horizon', 'Ignite',
    'Cloud', 'Data', 'Cyber', 'Fin', 'Tech', 'Bio', 'Eco', 'Omni', 'Nova'
  ];

  const companySuffixes = [
    'Labs', 'Systems', 'Networks', 'Tech', 'Solutions', 'Global', 'Dynamics', 'Capital',
    'Group', 'AI', 'Cloud', 'Interactive', 'Ventures', 'Digital', 'Analytics'
  ];

  const customerStatusArray: ('ACTIVE' | 'AT_RISK' | 'CHURNED' | 'VIP' | 'NEW')[] = [
    'ACTIVE', 'ACTIVE', 'ACTIVE', 'VIP', 'AT_RISK', 'NEW', 'CHURNED'
  ];

  const customerDataList = [];
  const now = new Date();

  for (let c = 1; c <= 500; c++) {
    const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
    const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
    const name = `${prefix} ${suffix} #${c}`;
    const email = `contact@${prefix.toLowerCase()}${suffix.toLowerCase()}${c}.io`;
    const phone = `+1 (${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 899) + 100}-${Math.floor(Math.random() * 8999) + 1000}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const status = customerStatusArray[Math.floor(Math.random() * customerStatusArray.length)];

    // Joined anywhere between 365 days ago and today
    const daysAgoJoined = Math.floor(Math.random() * 360) + 5;
    const customerSince = new Date(now.getTime() - daysAgoJoined * 24 * 60 * 60 * 1000);

    customerDataList.push({
      organizationId: org.id,
      name,
      email,
      phone,
      location,
      customerSince,
      status,
      totalRevenue: 0.0,
    });
  }

  await prisma.customer.createMany({
    data: customerDataList,
  });

  const customers = await prisma.customer.findMany({ where: { organizationId: org.id } });
  console.log(`✅ Created ${customers.length} Customers`);

  // 5. Generate 5,000 Transactions spanning 12 months (365 days)
  console.log('⏳ Generating 5,000 historical transactions across 12 months...');
  const paymentStatuses = ['PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];
  const paymentMethods = ['CARD', 'CARD', 'CARD', 'UPI', 'BANK_TRANSFER', 'CASH'];

  const transactionsToCreate = [];
  const totalTxCount = 5000;
  const customerRevenueMap: Record<string, { total: number; lastDate: Date }> = {};

  for (let i = 0; i < totalTxCount; i++) {
    // Distribute randomly across the past 365 days with monthly seasonal multipliers
    const daysAgo = Math.floor(Math.random() * 365);
    const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const cust = customers[Math.floor(Math.random() * customers.length)];
    const prod = products[Math.floor(Math.random() * products.length)];

    const qty = Math.floor(Math.random() * 5) + 1;
    const unitPrice = prod.price;
    const grossAmount = qty * unitPrice;

    // Normal vs Anomaly Discounts
    let discountPercent = 0;
    const randDisc = Math.random();
    if (randDisc > 0.85) {
      discountPercent = 0.15; // 15% discount
    } else if (randDisc > 0.96) {
      discountPercent = 0.35; // 35% excessive discount anomaly!
    }

    const discountAmount = Math.round(grossAmount * discountPercent);

    // Payment Status handling
    let paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    let refundAmount = 0;

    if (paymentStatus === 'REFUNDED') {
      refundAmount = grossAmount - discountAmount;
    } else if (paymentStatus === 'PARTIALLY_REFUNDED') {
      refundAmount = Math.round((grossAmount - discountAmount) * 0.5);
    }

    const netRevenue = paymentStatus === 'FAILED' ? 0 : Math.max(0, grossAmount - discountAmount - refundAmount);
    const costAmount = qty * prod.cost;
    const grossProfit = netRevenue - costAmount;
    const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    transactionsToCreate.push({
      organizationId: org.id,
      customerId: cust.id,
      productId: prod.id,
      salespersonId: i % 3 === 0 ? owner.id : i % 3 === 1 ? manager.id : staff.id,
      quantity: qty,
      unitPrice,
      grossAmount,
      discount: discountAmount,
      tax: Math.round(grossAmount * 0.08),
      refundAmount,
      netRevenue,
      costAmount,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      paymentStatus,
      paymentMethod,
      transactionDate: txDate,
      createdAt: txDate,
    });

    // Track customer total revenue and last purchase date
    if (!customerRevenueMap[cust.id]) {
      customerRevenueMap[cust.id] = { total: 0, lastDate: txDate };
    }
    if (paymentStatus === 'PAID') {
      customerRevenueMap[cust.id].total += netRevenue;
    }
    if (txDate > customerRevenueMap[cust.id].lastDate) {
      customerRevenueMap[cust.id].lastDate = txDate;
    }
  }

  // Batch insert transactions
  const chunkSize = 500;
  for (let i = 0; i < transactionsToCreate.length; i += chunkSize) {
    const chunk = transactionsToCreate.slice(i, i + chunkSize);
    await prisma.transaction.createMany({ data: chunk });
  }

  console.log(`✅ Seeded ${totalTxCount} Transactions!`);

  // Update customer totals in DB
  console.log('🔄 Updating customer aggregations...');
  for (const custId of Object.keys(customerRevenueMap)) {
    const data = customerRevenueMap[custId];
    await prisma.customer.update({
      where: { id: custId },
      data: {
        totalRevenue: Math.round(data.total * 100) / 100,
        lastPurchaseDate: data.lastDate,
      },
    });
  }

  // 6. Generate Potential Revenue Leaks based on transaction anomalies
  console.log('⚡ Generating Revenue Leakage alerts...');
  const sampleTransactions = await prisma.transaction.findMany({
    where: { organizationId: org.id },
    take: 300,
  });

  const leakDataList = [];
  for (const tx of sampleTransactions) {
    if (tx.discount > tx.grossAmount * 0.25) {
      leakDataList.push({
        organizationId: org.id,
        transactionId: tx.id,
        type: 'EXCESSIVE_DISCOUNT',
        amount: tx.discount,
        severity: 'HIGH',
        description: `Potential revenue leak: Excessive discount of ₹${tx.discount.toLocaleString()} (${Math.round((tx.discount / tx.grossAmount) * 100)}%) applied on order.`,
        status: 'OPEN',
        detectedDate: tx.transactionDate,
      });
    } else if (tx.paymentStatus === 'FAILED') {
      leakDataList.push({
        organizationId: org.id,
        transactionId: tx.id,
        type: 'FAILED_PAYMENT',
        amount: tx.grossAmount,
        severity: 'CRITICAL',
        description: `Potential revenue leak: Failed payment of ₹${tx.grossAmount.toLocaleString()} detected from customer. Uncollected revenue.`,
        status: 'OPEN',
        detectedDate: tx.transactionDate,
      });
    } else if (tx.profitMargin < 5 && tx.paymentStatus === 'PAID') {
      leakDataList.push({
        organizationId: org.id,
        transactionId: tx.id,
        type: 'LOW_MARGIN_TRANSACTION',
        amount: Math.round(tx.costAmount * 0.15),
        severity: 'MEDIUM',
        description: `Potential revenue leak: Transaction generated an abnormally low profit margin of ${tx.profitMargin.toFixed(1)}%.`,
        status: 'OPEN',
        detectedDate: tx.transactionDate,
      });
    }
  }

  await prisma.revenueLeak.createMany({
    data: leakDataList,
  });
  console.log(`✅ Seeded ${leakDataList.length} Revenue Leakage items`);

  // 7. Seed Churn Predictions for At-Risk customers
  console.log('🔮 Generating Churn Predictions...');
  const atRiskCustomers = await prisma.customer.findMany({
    where: { organizationId: org.id, status: 'AT_RISK' },
    take: 40,
  });

  for (const c of atRiskCustomers) {
    const daysSince = c.lastPurchaseDate 
      ? Math.floor((now.getTime() - new Date(c.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      : 75;
    const churnProb = 0.65 + Math.random() * 0.3; // 65% - 95%
    
    await prisma.churnPrediction.create({
      data: {
        organizationId: org.id,
        customerId: c.id,
        churnProbability: Math.round(churnProb * 100) / 100,
        riskLevel: churnProb > 0.8 ? 'HIGH' : 'MEDIUM',
        keyFactors: JSON.stringify([
          `No purchase activity for ${daysSince} days`,
          `Purchase frequency decreased by 42% over last quarter`,
          `Recent support ticket logged regarding pricing tier`
        ]),
        predictedDate: now,
      },
    });
  }
  console.log(`✅ Seeded Churn Predictions for ${atRiskCustomers.length} at-risk customers`);

  // 8. Seed AI Recommendations
  console.log('💡 Generating AI Recommendations...');
  await prisma.aIRecommendation.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Tighten Discount Approval Matrix',
        explanation: '14 transactions exceeded 25% discount threshold this month, leaking ₹1,85,000 in potential net margin.',
        priority: 'HIGH',
        potentialImpact: 185000.0,
        category: 'DISCOUNT',
        status: 'ACTIVE',
      },
      {
        organizationId: org.id,
        title: 'Re-engage 40 High-Value At-Risk Accounts',
        explanation: '40 key accounts haven\'t made a repeat purchase in over 60 days. Proactive outreach can protect ₹12,40,000 in ARR.',
        priority: 'HIGH',
        potentialImpact: 1240000.0,
        category: 'CHURN',
        status: 'ACTIVE',
      },
      {
        organizationId: org.id,
        title: 'Review Fulfillment Costs on Low-Margin Hardware Tier 1',
        explanation: 'Hardware Tier 1 maintains a low average profit margin of 6.2%. Consider bundled software licensing to lift overall margin.',
        priority: 'MEDIUM',
        potentialImpact: 420000.0,
        category: 'PRICING',
        status: 'ACTIVE',
      },
      {
        organizationId: org.id,
        title: 'Recover Failed Card Payments Automatically',
        explanation: '₹3,20,000 in failed transactions remain uncollected. Implement automated dunning emails and card retry workflows.',
        priority: 'HIGH',
        potentialImpact: 320000.0,
        category: 'PAYMENTS',
        status: 'ACTIVE',
      },
    ],
  });
  console.log('✅ Seeded AI Recommendations');

  // 9. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Potential Revenue Leakage Detected',
        message: '₹1,85,000 potential revenue leakage flagged across 14 transactions due to excessive discounts.',
        type: 'LEAKAGE',
        isRead: false,
      },
      {
        organizationId: org.id,
        title: 'High Churn Risk Warning',
        message: '40 high-value customers have moved to AT_RISK status based on ML recency modeling.',
        type: 'CHURN',
        isRead: false,
      },
      {
        organizationId: org.id,
        title: 'Monthly Revenue Target Milestone',
        message: 'Current monthly revenue is at 84.6% of the target ₹25,00,000 goal.',
        type: 'TARGET',
        isRead: true,
      },
    ],
  });
  console.log('✅ Seeded System Notifications');

  // 10. Seed Monthly Revenue Targets
  const currentYear = now.getFullYear();
  const targetData = [];
  for (let m = 1; m <= 12; m++) {
    targetData.push({
      organizationId: org.id,
      year: currentYear,
      month: m,
      targetAmount: 2500000.0,
      currentAmount: m === now.getMonth() + 1 ? 2115000.0 : 2350000.0 + (Math.random() * 400000 - 200000),
      achievementPercent: m === now.getMonth() + 1 ? 84.6 : 94.0,
    });
  }
  await prisma.revenueTarget.createMany({ data: targetData });
  console.log('✅ Seeded 12 Monthly Revenue Targets');

  console.log('🎉 DB SEED COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
