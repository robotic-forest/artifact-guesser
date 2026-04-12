/**
 * Smoke tests — quick sanity checks that the app boots and key endpoints respond.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { connectToTestEnv, disconnectTestEnv, createUser, authGet } from '../helpers/api-env.js';
import { createTestArtifacts, createTestDailyChallenge, clearAllCollections } from '../helpers/seed.js';

let baseUrl, db, mongoClient;

beforeAll(async () => {
  ({ baseUrl, db, mongoClient } = await connectToTestEnv());
  await clearAllCollections(db);
  const artifacts = await createTestArtifacts(db, 10);
  await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));
});

afterAll(async () => {
  await disconnectTestEnv(mongoClient);
});

describe('Smoke tests', () => {
  it('app boots and serves the homepage', async () => {
    const res = await fetch(baseUrl);
    expect(res.status).toBeLessThan(500);
  });

  it('/api/artifacts/random returns an artifact with expected shape', async () => {
    const res = await fetch(`${baseUrl}/api/artifacts/random`);
    expect(res.status).toBe(200);

    const artifact = await res.json();
    expect(artifact).toHaveProperty('_id');
    expect(artifact).toHaveProperty('name');
    expect(artifact).toHaveProperty('location');
    expect(artifact).toHaveProperty('time');
    expect(artifact).toHaveProperty('images');
    expect(artifact.images).toHaveProperty('external');
    expect(Array.isArray(artifact.images.external)).toBe(true);
  });

  it('/api/login returns structured error for bad credentials', async () => {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'nobody', password: 'wrong' }),
    });

    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBeTruthy();
  });

  it('/api/daily/current returns daily challenge data', async () => {
    const res = await fetch(`${baseUrl}/api/daily/current`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('daily');
    expect(data.daily).toHaveProperty('dateKey');
    expect(data.daily).toHaveProperty('rounds', 3);
  });

  it('static assets are served', async () => {
    const res = await fetch(`${baseUrl}/icon-sm.png`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image');
  });

  it('session roundtrip works (signup → /api/user)', async () => {
    const user = await createUser(baseUrl, {
      email: 'smoke@test.com',
      username: 'smoketest',
      password: 'SmokePass1!',
    });

    expect(user.body.success).toBe(true);

    const { data } = await authGet(baseUrl, '/api/user', user.cookie);
    expect(data.isLoggedIn).toBe(true);
    expect(data.username).toBe('smoketest');
  });
});
