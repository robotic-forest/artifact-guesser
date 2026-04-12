/**
 * Per-test-file helper that connects to the shared test environment.
 * Use in beforeAll/afterAll to get db handle + baseUrl.
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function connectToTestEnv() {
  const envPath = resolve(__dirname, '../.test-env.json');
  const { baseUrl, mongoUri, dbName } = JSON.parse(readFileSync(envPath, 'utf-8'));

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);

  return { baseUrl, db, mongoClient };
}

export async function disconnectTestEnv(mongoClient) {
  if (mongoClient) await mongoClient.close();
}

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

export async function authGet(baseUrl, path, cookie) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Cookie: cookie },
  });
  return { status: res.status, data: await res.json(), headers: res.headers };
}

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
