import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'task-tracker-')), 'test.db');
const { app } = await import('../src/server.js');

test('health endpoint returns ok', async () => {
  const server = app.listen();
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  server.close();
});

