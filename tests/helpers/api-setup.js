/**
 * Test environment for API integration tests.
 *
 * Spins up MongoMemoryServer and a real Next.js dev server, so tests
 * hit actual HTTP endpoints with real session handling and DB operations.
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

export async function createApiTestEnv() {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(TEST_DB);

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
    PORT: String(TEST_PORT),
  };

  const nextProcess = spawn('npx', ['next', 'dev', '-p', String(TEST_PORT)], {
    cwd: APP_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  nextProcess.stdout.on('data', (d) => { serverOutput += d.toString(); });
  nextProcess.stderr.on('data', (d) => { serverOutput += d.toString(); });

  // Wait for the server to be ready
  await waitForServer(`http://localhost:${TEST_PORT}`, 60000);

  return {
    baseUrl: `http://localhost:${TEST_PORT}`,
    db,
    mongoClient,
    mongod,
    nextProcess,
    serverOutput: () => serverOutput,
  };
}

export async function destroyApiTestEnv(env) {
  if (!env) return;
  if (env.nextProcess) {
    env.nextProcess.kill('SIGTERM');
    // Wait for process to actually exit
    await new Promise((resolve) => {
      env.nextProcess.on('exit', resolve);
      setTimeout(resolve, 3000);
    });
  }
  if (env.mongoClient) await env.mongoClient.close();
  if (env.mongod) await env.mongod.stop();
}

/**
 * Creates a user via /api/signup and returns the session cookie.
 */
export async function createUser(baseUrl, userData = {}) {
  const data = {
    email: userData.email || `test${Date.now()}@example.com`,
    username: userData.username || `testuser${Date.now()}`,
    password: userData.password || 'TestPass123!',
    ...userData,
  };

  const res = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'manual',
  });

  const cookie = res.headers.get('set-cookie');
  const body = await res.json();

  return { cookie, body, ...data };
}

/**
 * Logs in an existing user and returns the session cookie.
 */
export async function loginUser(baseUrl, identifier, password) {
  const res = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
    redirect: 'manual',
  });

  const cookie = res.headers.get('set-cookie');
  const body = await res.json();

  return { cookie, body };
}

/**
 * Makes an authenticated GET request.
 */
export async function authGet(baseUrl, path, cookie) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Cookie: cookie },
  });
  return { status: res.status, data: await res.json(), headers: res.headers };
}

/**
 * Makes an authenticated POST request.
 */
export async function authPost(baseUrl, path, body, cookie) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json(), headers: res.headers };
}

// -- Internals --

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
