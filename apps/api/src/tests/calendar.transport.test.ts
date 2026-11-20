import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), get: vi.fn() }));
vi.mock('node:dns/promises', () => ({ lookup: mocks.lookup }));
vi.mock('node:https', () => ({ default: { get: mocks.get } }));

import { fetchCalendar } from '../modules/availability/calendar.sync.js';

type ResponseSpec = {
  status: number;
  body?: string | Buffer;
  contentType?: string;
  location?: string;
};

function requestEmitter() {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    destroy(error: Error) {
      emitter.emit('error', error);
      emitter.emit('close');
    },
  });
}

function queueResponses(...specs: ResponseSpec[]) {
  let index = 0;
  mocks.get.mockImplementation(
    (
      _url: URL,
      _options: unknown,
      callback: (response: PassThrough) => void,
    ) => {
      const request = requestEmitter();
      const spec = specs[index++];
      if (!spec) throw new Error('unexpected_request');
      const response = Object.assign(new PassThrough(), {
        statusCode: spec.status,
        headers: {
          'content-type': spec.contentType ?? 'text/calendar',
          ...(spec.location ? { location: spec.location } : {}),
        },
      });
      response.on('end', () => request.emit('close'));
      queueMicrotask(() => {
        callback(response);
        response.end(spec.body ?? 'BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n');
      });
      return request;
    },
  );
}

describe('calendar HTTPS transport', () => {
  beforeEach(() => {
    mocks.lookup
      .mockReset()
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mocks.get.mockReset();
  });

  it('revalidates every redirect and refuses a private destination', async () => {
    queueResponses({ status: 302, location: 'https://127.0.0.1/private.ics' });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('Calendar URL must be a public HTTPS host');
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });

  it('follows a public redirect with a fresh DNS check and pinned address', async () => {
    queueResponses(
      { status: 302, location: 'https://other.example.com/feed.ics' },
      { status: 200, body: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n' },
    );
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).resolves.toContain('BEGIN:VCALENDAR');
    expect(mocks.lookup).toHaveBeenCalledTimes(2);
    expect(mocks.get).toHaveBeenCalledTimes(2);
    const options = mocks.get.mock.calls[1]?.[1] as {
      lookup: (
        host: string,
        options: unknown,
        callback: (error: null, address: string, family: number) => void,
      ) => void;
    };
    let pinned = '';
    options.lookup('other.example.com', {}, (_error, address) => {
      pinned = address;
    });
    expect(pinned).toBe('8.8.8.8');
  });

  it('rejects mixed public and private DNS answers before opening a socket', async () => {
    mocks.lookup.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '10.0.0.1', family: 4 },
    ]);
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('unsafe_address');
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('aborts a timed-out request', async () => {
    mocks.get.mockImplementation(() => {
      const request = requestEmitter();
      queueMicrotask(() => request.emit('timeout'));
      return request;
    });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('timeout');
  });

  it('enforces the total request deadline', async () => {
    vi.useFakeTimers();
    try {
      mocks.get.mockImplementation(() => requestEmitter());
      const result = expect(
        fetchCalendar('https://calendar.example.com/feed.ics'),
      ).rejects.toThrow('timeout');
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(15_000);
      await result;
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects oversized and unexpected responses', async () => {
    queueResponses({ status: 200, body: Buffer.alloc(2_000_001) });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('calendar_too_large');
    queueResponses({ status: 200, contentType: 'text/html' });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('unexpected_content');
    queueResponses({ status: 503 });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('http_failure');
  });

  it('enforces a redirect limit and rejects missing locations', async () => {
    queueResponses(
      { status: 302, location: 'https://other.example.com/feed.ics' },
      { status: 302, location: 'https://other.example.com/feed.ics' },
      { status: 302, location: 'https://other.example.com/feed.ics' },
      { status: 302, location: 'https://other.example.com/feed.ics' },
    );
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('redirect_limit');
    queueResponses({ status: 302 });
    await expect(
      fetchCalendar('https://calendar.example.com/feed.ics'),
    ).rejects.toThrow('invalid_redirect');
  });
});
