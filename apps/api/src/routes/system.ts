import { Router } from 'express';

export function systemRoutes(checkDatabase: () => Promise<void>): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'kasvin-api',
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/ready', async (_req, res) => {
    try {
      await checkDatabase();
      res.json({ status: 'ready', service: 'kasvin-api' });
    } catch {
      res.status(503).json({ status: 'unavailable', service: 'kasvin-api' });
    }
  });

  return router;
}
