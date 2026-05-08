/**
 * Playwright global setup — reuses the same MongoMemoryServer + Next.js
 * launcher as the Vitest API tests so e2e runs against an isolated DB.
 * Also seeds artifacts so the homepage game can pull random artifacts.
 */
import { setup } from '../helpers/global-api-setup.js';
import { createTestArtifacts, createTestDailyChallenge } from '../helpers/seed.js';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async () => {
  await setup();

  // Read connection info written by global-api-setup.js
  const envFile = path.resolve(__dirname, '../.test-env.json');
  const { mongoUri, dbName } = JSON.parse(fs.readFileSync(envFile, 'utf-8'));

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  const artifacts = await createTestArtifacts(db, 20);
  await createTestDailyChallenge(db, artifacts.slice(0, 3).map(a => a._id));

  await client.close();
};
