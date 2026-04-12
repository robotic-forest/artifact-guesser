/**
 * Tests: Game CRUD and scoring
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectToTestEnv, disconnectTestEnv, createUser, authGet, authPost } from '../helpers/api-env.js';
import { createTestArtifacts, clearAllCollections } from '../helpers/seed.js';

let baseUrl, db, mongoClient;

beforeAll(async () => {
  ({ baseUrl, db, mongoClient } = await connectToTestEnv());
});

afterAll(async () => {
  await disconnectTestEnv(mongoClient);
});

beforeEach(async () => {
  await clearAllCollections(db);
  await createTestArtifacts(db, 20);
});

describe('Game lifecycle', () => {
  it('creates a new game via /api/games/current', async () => {
    const user = await createUser(baseUrl);

    const { data } = await authGet(baseUrl, '/api/games/current', user.cookie);

    expect(data).toHaveProperty('_id');
    expect(data.round).toBe(1);
    expect(data.rounds).toBe(5);
    expect(data.score).toBe(0);
    expect(data.ongoing).toBe(true);
    expect(data.roundData).toHaveLength(1);
    expect(data.roundData[0].artifact).toBeTruthy();
  });

  it('returns the same ongoing game on repeated fetches', async () => {
    const user = await createUser(baseUrl);

    const r1 = await authGet(baseUrl, '/api/games/current', user.cookie);
    const r2 = await authGet(baseUrl, '/api/games/current', user.cookie);

    expect(r1.data._id.toString()).toBe(r2.data._id.toString());
  });

  it('updates game via /api/games/edit', async () => {
    const user = await createUser(baseUrl);
    const { data: game } = await authGet(baseUrl, '/api/games/current', user.cookie);

    const updatedGame = {
      ...game,
      roundData: [{
        ...game.roundData[0],
        guessed: true,
        selectedDate: -1000,
        selectedCountry: 'Egypt',
        datePoints: 80,
        countryPoints: 100,
        points: 180,
      }],
      score: 180,
    };

    const editRes = await authPost(baseUrl, '/api/games/edit', updatedGame, user.cookie);
    expect(editRes.data.success).toBe(true);
  });

  it('respects mode from query parameter', async () => {
    const user = await createUser(baseUrl);

    const { data } = await authGet(baseUrl, '/api/games/current?mode=Highlights', user.cookie);
    expect(data.mode).toBe('Highlights');
  });

  it('prevents editing another user\'s game', async () => {
    const user1 = await createUser(baseUrl, { email: 'u1@test.com', username: 'user1' });
    const user2 = await createUser(baseUrl, { email: 'u2@test.com', username: 'user2' });

    const { data: game } = await authGet(baseUrl, '/api/games/current', user1.cookie);

    // user2 tries to edit user1's game
    const editRes = await authPost(baseUrl, '/api/games/edit', {
      _id: game._id,
      score: 9999,
      roundData: game.roundData,
    }, user2.cookie);

    expect(editRes.data.success).toBe(false);
  });
});

describe('Random artifact', () => {
  it('returns a valid artifact', async () => {
    const res = await fetch(`${baseUrl}/api/artifacts/random`);
    expect(res.status).toBe(200);

    const artifact = await res.json();
    expect(artifact).toHaveProperty('name');
    expect(artifact).toHaveProperty('location.country');
    expect(artifact).toHaveProperty('time.start');
    expect(artifact).toHaveProperty('time.end');
  });

  it('respects mode parameter', async () => {
    const res = await fetch(`${baseUrl}/api/artifacts/random?mode=Highlights`);
    expect(res.status).toBe(200);

    const artifact = await res.json();
    expect(artifact.isHighlight).toBe(true);
  });
});
