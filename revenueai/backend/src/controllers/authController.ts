import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', parse.error.format());
    }

    const { fullName, email, password, businessName, businessType } = parse.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email address already registered', 400, 'USER_EXISTS');
    }

    const hashedPassword = await hashPassword(password);

    // Create Organization + Owner User transactionally
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: businessName,
          businessType: businessType,
          monthlyTarget: 1500000.0,
        },
      });

      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          role: 'OWNER',
          organizationId: org.id,
        },
      });

      // Default targets
      const now = new Date();
      await tx.revenueTarget.create({
        data: {
          organizationId: org.id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          targetAmount: 1500000.0,
        },
      });

      return { user, org };
    });

    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.org.id,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        organization: {
          id: result.org.id,
          name: result.org.name,
          businessType: result.org.businessType,
          monthlyTarget: result.org.monthlyTarget,
        },
      },
    }, 'Registration successful', 201);
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Failed to complete registration', 500, 'SERVER_ERROR');
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return sendError(res, 'Invalid credentials format', 400, 'VALIDATION_ERROR');
    }

    const { email, password } = parse.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          businessType: user.organization.businessType,
          monthlyTarget: user.organization.monthlyTarget,
        },
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed', 500, 'SERVER_ERROR');
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { organization: true },
    });

    if (!user) {
      return sendError(res, 'User not found', 44, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          businessType: user.organization.businessType,
          monthlyTarget: user.organization.monthlyTarget,
        },
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch user profile', 500, 'SERVER_ERROR');
  }
}
