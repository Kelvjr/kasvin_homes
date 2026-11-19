import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@kasvin/database';
import { logger } from '../lib/logger.js';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (res.headersSent) return;
  if (error instanceof ApiError) {
    res
      .status(error.status)
      .json({ error: error.code, message: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        error: 'conflict',
        message: 'A unique value is already in use',
      });
      return;
    }
    if (error.code === 'P2025') {
      res
        .status(404)
        .json({ error: 'not_found', message: 'Resource not found' });
      return;
    }
    if (error.code === 'P2003') {
      res.status(400).json({
        error: 'invalid_reference',
        message: 'A referenced resource does not exist',
      });
      return;
    }
  }
  const badRequest =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 400;
  if (!badRequest)
    logger.error(
      { errorType: error instanceof Error ? error.name : 'unknown' },
      'Unhandled request error',
    );
  res.status(badRequest ? 400 : 500).json({
    error: badRequest ? 'bad_request' : 'internal_error',
    message: badRequest ? 'Bad request' : 'Internal server error',
  });
};
