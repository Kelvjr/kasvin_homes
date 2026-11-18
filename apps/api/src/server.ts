import 'dotenv/config';
import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from '@kasvin/database';
import { createApp } from './app.js';
import { parseConfig } from './config/env.js';
import { logger } from './lib/logger.js';

const config = parseConfig(process.env);
const app = createApp(config, () =>
  checkDatabaseConnection(config.DATABASE_URL),
);
const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'Kasvin API listening');
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down');
  server.close(async (error) => {
    try {
      await closeDatabaseConnection();
      if (error) logger.error({ err: error }, 'Server close failed');
      process.exitCode = error ? 1 : 0;
    } catch (closeError) {
      logger.error({ err: closeError }, 'Database close failed');
      process.exitCode = 1;
    }
  });
  setTimeout(() => {
    logger.error('Shutdown timed out');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
