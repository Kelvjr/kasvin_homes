import type { ErrorRequestHandler, RequestHandler } from 'express';
import { logger } from '../lib/logger.js';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  logger.error({ err: error }, 'Unhandled request error');
  if (res.headersSent) return;
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 400
      ? 400
      : 500;
  res
    .status(status)
    .json({ error: status === 400 ? 'Bad request' : 'Internal server error' });
};
