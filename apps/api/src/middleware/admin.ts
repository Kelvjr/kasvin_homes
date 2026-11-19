import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { AppConfig } from '../config/env.js';

export function requireAdmin(config: AppConfig): RequestHandler {
  return (req, res, next) => {
    if (config.NODE_ENV === 'production' || !config.DEV_ADMIN_TOKEN) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Admin access is unavailable',
      });
      return;
    }
    const match = /^Bearer ([A-Za-z0-9_-]{32,})$/.exec(
      req.header('authorization') ?? '',
    );
    if (!match) {
      res
        .status(401)
        .json({ error: 'unauthorized', message: 'Admin token required' });
      return;
    }
    const actual = createHash('sha256')
      .update(match[1] ?? '')
      .digest();
    const expected = createHash('sha256')
      .update(config.DEV_ADMIN_TOKEN)
      .digest();
    if (!timingSafeEqual(actual, expected)) {
      res
        .status(401)
        .json({ error: 'unauthorized', message: 'Invalid admin token' });
      return;
    }
    next();
  };
}
