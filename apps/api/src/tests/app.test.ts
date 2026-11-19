import request from 'supertest';
import express from 'express';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { parseConfig } from '../config/env.js';
import { errorHandler } from '../middleware/error.js';

const config = parseConfig({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://localhost:5432/kasvin_test',
  CORS_ORIGINS: 'http://localhost:3000,http://localhost:3001',
});

describe('system routes', () => {
  it('returns a structured health response without database access', async () => {
    const response = await request(
      createApp(config, async () => {
        throw new Error('Should not run');
      }),
    ).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'kasvin-api',
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(createApp(config, async () => {})).get(
      '/api/v1/unknown',
    );
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'not_found', message: 'Not found' });
  });

  it('handles unexpected errors without leaking details', async () => {
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret detail');
    });
    app.use(errorHandler);
    const response = await request(app).get('/boom');
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain('secret detail');
  });

  it('reports readiness when the database is reachable', async () => {
    const response = await request(createApp(config, async () => {})).get(
      '/api/v1/ready',
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ready');
  });

  it('reports 503 without leaking a database error', async () => {
    const response = await request(
      createApp(config, async () => {
        throw new Error('private connection string');
      }),
    ).get('/api/v1/ready');
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain(
      'private connection string',
    );
  });
});

describe('configuration', () => {
  it('rejects missing or invalid database configuration', () => {
    expect(() =>
      parseConfig({ CORS_ORIGINS: 'http://localhost:3000' }),
    ).toThrow('DATABASE_URL');
    expect(() =>
      parseConfig({ DATABASE_URL: 'not-a-url', CORS_ORIGINS: '*' }),
    ).toThrow('Invalid API configuration');
  });
});
