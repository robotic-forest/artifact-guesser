/**
 * Vitest global setup — starts MongoMemoryServer + Next.js dev server ONCE
 * for the entire API test run.
 *
 * Uses `next dev` with sequential route warmup. The warmup compiles each API
 * route once so individual tests don't hit cold-compilation timeouts.
 * After warmup, the server idles at ~90MB / <1% CPU.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '../..');
const TEST_PORT = 3099;
const TEST_DB = 'ag_test';

let mongod, mongoClient, nextProcess;

export async function setup() {
  // Kill any leftover processes from previous runs
  try {
    const { execSync } = await import('child_process');
    execSync(`kill -9 $(lsof -t -i:${TEST_PORT}) 2>/dev/null || true`, { stdio: 'ignore' });
  } catch {}

  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();

  const env = {
    ...process.env,
    MONGODB_URI: mongoUri,
    MONGODB_DATABASE: TEST_DB,
    SESSION_PASSWORD: 'test-session-password-that-is-at-least-32-chars!!',
    SECRET: 'test-jwt-secret-for-testing-only',
    DOMAIN: `http://localhost:${TEST_PORT}`,
    STRIPE_LIVE_SECRET_KEY: 'sk_test_fake',
    MAILJET_USER: 'fake',
    MAILJET_PASSWORD: 'fake',
    NODE_ENV: 'development',
  };

  nextProcess = spawn('npx', ['next', 'dev', '-p', String(TEST_PORT)], {
    cwd: APP_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Drain stdout/stderr to prevent pipe buffer deadlock
  nextProcess.stdout.on('data', () => {});
  nextProcess.stderr.on('data', () => {});

  console.log('[test-setup] Waiting for Next.js dev server...');
  await waitForServer(`http://localhost:${TEST_PORT}`, 60000);
  console.log('[test-setup] Server ready. Warming routes...');

  // Warm up routes sequentially so individual tests don't timeout on compilation
  const baseUrl = `http://localhost:${TEST_PORT}`;
  const warmupRoutes = [
    ['/api/user', 'GET'],
    ['/api/signup', 'POST'],
    ['/api/login', 'POST'],
    ['/api/logout', 'POST'],
    ['/api/artifacts/random', 'GET'],
    ['/api/daily/current', 'GET'],
    ['/api/daily/edit', 'POST'],
    ['/api/daily/artifact?id=000000000000000000000000', 'GET'],
    ['/api/daily/leaderboard', 'GET'],
    ['/api/games/current', 'GET'],
    ['/api/games/edit', 'POST'],
    ['/api/games/highscores', 'GET'],
    ['/api/challenges/create', 'POST'],
    ['/api/challenges/000000000000000000000000', 'GET'],
    ['/api/accounts/edit', 'POST'],
    ['/api/analytics/event', 'POST'],
  ];

  for (const [route, method] of warmupRoutes) {
    try {
      await fetch(`${baseUrl}${route}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? '{}' : undefined,
      });
    } catch {}
  }

  console.log('[test-setup] Warmup complete. Running tests...');

  // Write connection info for test workers
  const fs = await import('fs');
  fs.writeFileSync(
    path.resolve(__dirname, '../.test-env.json'),
    JSON.stringify({ baseUrl, mongoUri, dbName: TEST_DB })
  );
}

export async function teardown() {
  // Kill the Next.js process tree (not just the parent)
  if (nextProcess?.pid) {
    try {
      const { execSync } = await import('child_process');
      execSync(`kill -9 $(lsof -t -i:${TEST_PORT}) 2>/dev/null || true`, { stdio: 'ignore' });
    } catch {}
  }
  if (mongoClient) {
    try { await mongoClient.close(); } catch {}
  }
  if (mongod) {
    try { await mongod.stop(); } catch {}
  }
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}
