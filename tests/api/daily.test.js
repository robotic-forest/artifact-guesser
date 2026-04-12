/**
 * Tests: Daily challenge flow (create, play, score, leaderboard)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectToTestEnv, disconnectTestEnv, createUser, authGet, authPost } from '../helpers/api-env.js';
import { createTestArtifacts, createTestDailyChallenge, clearAllCollections } from '../helpers/seed.js';
import { ObjectId } from 'mongodb';

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

describe('Daily challenge', () => {
  it('returns a pre-seeded daily challenge for anonymous users', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    const res = await fetch(`${baseUrl}/api/daily/current`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.daily.rounds).toBe(3);
    expect(data.daily.artifactIds).toHaveLength(3);
    expect(data.artifact).toBeTruthy();
    expect(data.artifact.name).toBe(artifacts[0].name);
  });

  it('creates a daily game for logged-in users', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    const user = await createUser(baseUrl);

    const { data } = await authGet(baseUrl, '/api/daily/current', user.cookie);
    expect(data.game).toBeTruthy();
    expect(data.game.round).toBe(1);
    expect(data.game.rounds).toBe(3);
    expect(data.game.score).toBe(0);
    expect(data.game.roundData).toHaveLength(1);
    expect(data.game.roundData[0].artifact).toBeTruthy();
  });

  it('returns the same game on subsequent fetches', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    const user = await createUser(baseUrl);

    const r1 = await authGet(baseUrl, '/api/daily/current', user.cookie);
    const r2 = await authGet(baseUrl, '/api/daily/current', user.cookie);

    expect(r1.data.game._id).toBe(r2.data.game._id);
  });

  it('allows saving round guesses via /api/daily/edit', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

    const user = await createUser(baseUrl);
    const { data: initial } = await authGet(baseUrl, '/api/daily/current', user.cookie);

    const updatedGame = {
      ...initial.game,
      roundData: [{
        ...initial.game.roundData[0],
        guessed: true,
        selectedDate: -1500,
        selectedCountry: 'Egypt',
        datePoints: 100,
        countryPoints: 100,
        points: 200,
      }],
      score: 200,
    };

    const editRes = await authPost(baseUrl, '/api/daily/edit', updatedGame, user.cookie);
    expect(editRes.data.success).toBe(true);

    // Verify the save persisted
    const { data: refetched } = await authGet(baseUrl, '/api/daily/current', user.cookie);
    expect(refetched.game.score).toBe(200);
    expect(refetched.game.roundData[0].guessed).toBe(true);
  });

  it('fetches individual artifacts via /api/daily/artifact', async () => {
    const artifacts = await createTestArtifacts(db, 3);

    const res = await fetch(`${baseUrl}/api/daily/artifact?id=${artifacts[1]._id}`);
    expect(res.status).toBe(200);

    const artifact = await res.json();
    expect(artifact.name).toBe(artifacts[1].name);
  });
});

describe('Daily leaderboard', () => {
  it('returns empty scores when no completions exist', async () => {
    const res = await fetch(`${baseUrl}/api/daily/leaderboard`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.scores).toEqual([]);
  });

  it('returns completed scores ranked by score descending', async () => {
    const artifacts = await createTestArtifacts(db, 5);
    await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));
    const dateKey = new Date().toISOString().slice(0, 10);

    // Create two users, both complete the daily with different scores
    const user1 = await createUser(baseUrl, { username: 'player1', email: 'p1@test.com' });
    const user2 = await createUser(baseUrl, { username: 'player2', email: 'p2@test.com' });

    // Fetch their daily games
    const g1 = await authGet(baseUrl, '/api/daily/current', user1.cookie);
    const g2 = await authGet(baseUrl, '/api/daily/current', user2.cookie);

    // Mark both as completed with different scores (directly in DB for speed)
    await db.collection('dailyGames').updateOne(
      { _id: new ObjectId(g1.data.game._id) },
      { $set: { completed: true, score: 450, completedAt: new Date() } }
    );
    await db.collection('dailyGames').updateOne(
      { _id: new ObjectId(g2.data.game._id) },
      { $set: { completed: true, score: 300, completedAt: new Date() } }
    );

    const res = await fetch(`${baseUrl}/api/daily/leaderboard?dateKey=${dateKey}`);
    const data = await res.json();

    expect(data.scores).toHaveLength(2);
    expect(data.scores[0].username).toBe('player1');
    expect(data.scores[0].score).toBe(450);
    expect(data.scores[1].username).toBe('player2');
    expect(data.scores[1].score).toBe(300);
  });
});
