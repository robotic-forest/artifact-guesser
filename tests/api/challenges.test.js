/**
 * Tests: Friend challenge system (create, fetch, play)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectToTestEnv, disconnectTestEnv, createUser, authPost } from '../helpers/api-env.js';
import { createTestArtifacts, createTestDailyChallenge, clearAllCollections } from '../helpers/seed.js';

let baseUrl, db, mongoClient;

beforeAll(async () => {
  ({ baseUrl, db, mongoClient } = await connectToTestEnv());
});

afterAll(async () => {
  await disconnectTestEnv(mongoClient);
});

beforeEach(async () => {
  await clearAllCollections(db);
});

describe('Friend challenges', () => {
  it('creates a challenge from a completed daily run', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    const res = await authPost(baseUrl, '/api/challenges/create', {
      dateKey: new Date().toISOString().slice(0, 10),
      score: 420,
      username: 'testplayer',
    });

    expect(res.data.challengeId).toBeTruthy();
  });

  it('fetches a challenge by ID with first artifact', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    const dateKey = new Date().toISOString().slice(0, 10);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    // Create the challenge
    const createRes = await authPost(baseUrl, '/api/challenges/create', {
      dateKey,
      score: 350,
      username: 'challenger',
    });

    const challengeId = createRes.data.challengeId;

    // Fetch it
    const res = await fetch(`${baseUrl}/api/challenges/${challengeId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.challenge).toBeTruthy();
    expect(data.challenge.challengerUsername).toBe('challenger');
    expect(data.challenge.challengerScore).toBe(350);
    expect(data.challenge.artifactIds).toHaveLength(3);
    expect(data.artifact).toBeTruthy();
    expect(data.artifact._id.toString()).toBe(artifacts[0]._id.toString());
  });

  it('challenge uses the same artifacts as the daily', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    const ids = artifacts.slice(0, 3).map(a => a._id);
    const dateKey = new Date().toISOString().slice(0, 10);
    await createTestDailyChallenge(db, ids);

    const createRes = await authPost(baseUrl, '/api/challenges/create', {
      dateKey,
      score: 500,
      username: 'tester',
    });

    const res = await fetch(`${baseUrl}/api/challenges/${createRes.data.challengeId}`);
    const data = await res.json();

    expect(data.challenge.artifactIds).toEqual(ids.map(id => id.toString()));
  });

  it('returns 404 for nonexistent challenge', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/000000000000000000000000`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid challenge ID', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/not-a-valid-id`);
    expect(res.status).toBe(400);
  });
});
