/**
 * Data factory functions for test seeding.
 *
 * Each function inserts a document into the test DB and returns it.
 * Use these to set up known state before test assertions.
 */

import { ObjectId } from 'mongodb';

const WORKING_IMAGE = 'https://images.metmuseum.org/CRDImages/as/original/DP251139.jpg';

export async function createTestArtifact(db, overrides = {}) {
  const artifact = {
    _id: new ObjectId(),
    name: overrides.name || 'Test Artifact',
    culture: overrides.culture || 'Test Culture',
    medium: overrides.medium || 'Stone',
    dimensions: '10 x 10 cm',
    isHighlight: overrides.isHighlight ?? true,
    problematic: false,
    location: {
      country: overrides.country || 'Egypt',
      county: '', city: '', state: '', subregion: '', region: '', river: '', locale: '',
      ...(overrides.location || {}),
    },
    time: {
      start: overrides.timeStart ?? -2000,
      end: overrides.timeEnd ?? -1500,
      description: 'ca. 2000-1500 BC',
      ...(overrides.time || {}),
    },
    images: {
      external: overrides.images || [WORKING_IMAGE],
      thumbnail: overrides.thumbnail || WORKING_IMAGE,
    },
    source: {
      name: overrides.sourceName || 'Test Museum',
      id: overrides.sourceId || `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
  };

  await db.collection('artifacts').insertOne(artifact);
  return artifact;
}

export async function createTestArtifacts(db, count = 5, overrides = {}) {
  const artifacts = [];
  const countries = ['Egypt', 'Iraq', 'Iran', 'Greece', 'Italy', 'China', 'Japan', 'Mexico'];
  const museums = [
    'https://images.metmuseum.org/CRDImages/as/original/DP251139.jpg',
    'https://openaccess-cdn.clevelandart.org/1947.177.a/1947.177.a_web.jpg',
    'https://media.britishmuseum.org/media/image/some-test.jpg',
  ];

  for (let i = 0; i < count; i++) {
    const a = await createTestArtifact(db, {
      name: `Test Artifact ${i + 1}`,
      country: countries[i % countries.length],
      images: [museums[i % museums.length]],
      sourceId: `test-seed-${i}-${Date.now()}`,
      ...overrides,
    });
    artifacts.push(a);
  }
  return artifacts;
}

export async function createTestAccount(db, overrides = {}) {
  const bcrypt = await import('bcryptjs');
  const password = overrides.password || 'TestPass123!';
  const hash = bcrypt.default.hashSync(password, 10);

  const account = {
    _id: new ObjectId(),
    email: overrides.email || `test${Date.now()}@example.com`,
    username: overrides.username || `testuser${Date.now()}`,
    password: hash,
    currentMode: 'Balanced',
    currentTimer: null,
    role: overrides.role || undefined,
    ...overrides,
    // Always hash the password
  };
  delete account.password;
  account.password = hash;

  await db.collection('accounts').insertOne(account);
  return { ...account, plainPassword: password };
}

export async function createTestDailyChallenge(db, artifactIds, overrides = {}) {
  const dateKey = overrides.dateKey || new Date().toISOString().slice(0, 10);

  const daily = {
    dateKey,
    createdAt: new Date(),
    artifactIds: artifactIds.map(id => id.toString()),
    rounds: overrides.rounds || 3,
    ...overrides,
  };

  await db.collection('dailyChallenges').insertOne(daily);
  return daily;
}

export async function clearAllCollections(db) {
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }
}
