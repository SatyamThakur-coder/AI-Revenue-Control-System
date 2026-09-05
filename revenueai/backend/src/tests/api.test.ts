import request from 'supertest';
import app from '../app';
import { calculateTransactionFinance } from '../utils/finance';

describe('RevenueAI Backend Unit & API Integration Tests', () => {

  // 1. Financial Math Engine Unit Test
  describe('Financial Math Utility (finance.ts)', () => {
    it('should correctly calculate gross, discount, net revenue, profit, and margin', () => {
      const result = calculateTransactionFinance({
        quantity: 2,
        unitPrice: 1000,
        discountInput: 10,
        discountIsPercentage: true,
        refundAmount: 0,
        productCost: 300,
        paymentStatus: 'PAID',
      });

      expect(result.grossAmount).toBe(2000);
      expect(result.discount).toBe(200);
      expect(result.netRevenue).toBe(1800);
      expect(result.costAmount).toBe(600);
      expect(result.grossProfit).toBe(1200);
      expect(result.profitMargin).toBe(66.67);
    });

    it('should handle zero net revenue for failed payment transactions', () => {
      const result = calculateTransactionFinance({
        quantity: 1,
        unitPrice: 500,
        productCost: 100,
        paymentStatus: 'FAILED',
      });

      expect(result.netRevenue).toBe(0);
      expect(result.grossProfit).toBe(-100);
    });
  });

  // 2. Auth Endpoints & Business APIs with Dynamic Test Account
  describe('Authentication & Business Endpoints', () => {
    let token = '';
    const testEmail = `test_${Date.now()}@revenueai.com`;

    it('should register a new business account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test Owner',
          email: testEmail,
          password: 'TestPassword123!',
          businessName: 'Test Corp',
          businessType: 'B2B SaaS',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      token = res.body.data.token;
    });

    it('should login with the newly created account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject unauthorized access without token', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('UNAUTHORIZED');
    });

    it('should fetch profile via GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('should create and list customers under tenant isolation', async () => {
      // Create Customer
      const createRes = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Acme Test Client',
          email: 'client@acmetest.io',
          phone: '+1 555-0192',
          location: 'San Francisco, CA',
        });

      expect(createRes.status).toBe(201);

      // List Customers
      const listRes = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.customers.length).toBeGreaterThan(0);
    });

    it('should fetch analytics overview KPIs', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.monthlyTarget).toBeDefined();
    });
  });

});
