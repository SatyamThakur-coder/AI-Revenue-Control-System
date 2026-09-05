import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { processAIChatRequest } from '../services/aiEngine';
import { sendSuccess, sendError } from '../utils/response';

export async function handleAIChat(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return sendError(res, 'Please provide a valid question for the AI Assistant', 400, 'INVALID_QUESTION');
    }

    const aiResult = await processAIChatRequest(orgId, question);
    return sendSuccess(res, aiResult);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return sendError(res, 'Unable to process AI assistant request', 500, 'AI_ERROR');
  }
}

export async function getAIRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;

    const recommendations = await prisma.aIRecommendation.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, recommendations);
  } catch (error) {
    return sendError(res, 'Failed to fetch AI recommendations', 500, 'FETCH_ERROR');
  }
}

export async function updateAIRecommendationStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user!.organizationId;
    const id = req.params.id as string;
    const { status } = req.body;

    const existing = await prisma.aIRecommendation.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return sendError(res, 'Recommendation not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.aIRecommendation.update({
      where: { id },
      data: { status },
    });

    return sendSuccess(res, updated, `Recommendation status updated to ${status}`);
  } catch (error) {
    return sendError(res, 'Failed to update recommendation status', 500, 'UPDATE_ERROR');
  }
}
