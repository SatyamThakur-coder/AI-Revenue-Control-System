import { Response } from 'express';

export function sendSuccess(res: Response, data: any, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 400, errorCode = 'BAD_REQUEST', details: any = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
  });
}
