import 'dotenv/config';
import { closeDatabaseConnection, getDatabaseClient } from '@kasvin/database';
import { parseConfig } from './config/env.js';
import { logger } from './lib/logger.js';
import { CalendarSyncService } from './modules/availability/calendar.sync.js';

const config = parseConfig(process.env);
const service = new CalendarSyncService(getDatabaseClient(config.DATABASE_URL));
try {
  const id = process.argv[2];
  const results = id
    ? [{ id, ...(await service.sync(id)) }]
    : await service.syncAll();
  logger.info(
    {
      total: results.length,
      failed: results.filter((item) => item.status === 'failed').length,
    },
    'Calendar sync completed',
  );
  if (results.some((item) => item.status === 'failed')) process.exitCode = 1;
} catch {
  logger.error('Calendar sync failed');
  process.exitCode = 1;
} finally {
  await closeDatabaseConnection();
}
