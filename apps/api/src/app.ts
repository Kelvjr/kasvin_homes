import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { API_VERSION } from '@kasvin/shared';
import type { AppConfig } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFound } from './middleware/error.js';
import { systemRoutes } from './routes/system.js';

export function createApp(
  config: AppConfig,
  checkDatabase: () => Promise<void>,
): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === `/api/${API_VERSION}/health`,
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  app.use(`/api/${API_VERSION}`, systemRoutes(checkDatabase));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
