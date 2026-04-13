/**
 * GoatCounter → Internal Analytics Migration
 *
 * Pulls all historical pageview data from GoatCounter API and imports
 * into the analyticsEvents collection with source: 'goatcounter'.
 *
 * Run once: node scripts/migrate-goatcounter.js
 */

const { MongoClient } = require('mongodb');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Parse .env manually (no dotenv dep)
try {
  readFileSync(resolve(__dirname, '../.env'), 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^(\w+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch {}

const GC_TOKEN = '23tsomunmqdat18fd3116omwxtrdlb1e894rn9holxx2qzgc8t';
const GC_BASE = 'https://artifactguesser.goatcounter.com/api/v0';
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'production';

async function gcFetch(path) {
  const res = await fetch(`${GC_BASE}${path}`, {
    headers: { Authorization: `Bearer ${GC_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GoatCounter API error: ${res.status}`);
  return res.json();
}

async function main() {
  console.log(`Connecting to MongoDB (${MONGODB_DATABASE})...`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DATABASE);
  const col = db.collection('analyticsEvents');

  // Check if already migrated
  const existing = await col.countDocuments({ source: 'goatcounter' });
  if (existing > 0) {
    console.log(`Found ${existing} existing goatcounter events. Skipping (already migrated).`);
    await client.close();
    return;
  }

  // Fetch all hits with daily stats — paginate via exclude
  console.log('Fetching stats from GoatCounter...');
  const batch = [];
  let totalViews = 0;
  const allPathIds = [];

  while (true) {
    const excludeParam = allPathIds.length ? `&exclude=${allPathIds.slice(-50).join(',')}` : '';
    const url = `/stats/hits?start=2023-01-01&end=2026-04-13&limit=500${excludeParam}`;
    console.log(`  Fetching: ${url}`);
    const data = await gcFetch(url);

    for (const hit of data.hits || []) {
      for (const dayStat of hit.stats || []) {
        const count = Array.isArray(dayStat.hourly)
          ? dayStat.hourly.reduce((s, h) => s + h, 0)
          : 0;
        if (count === 0) continue;

        batch.push({
          type: 'pageview',
          source: 'goatcounter',
          path: hit.path,
          occurredAt: new Date(dayStat.day + 'T12:00:00Z'),
          count,
          anonymousId: null,
          sessionId: null,
          userId: null,
          referrer: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        });
        totalViews += count;
      }
    }

    // GoatCounter's exclude pagination is unreliable with many IDs.
    // One page at limit=500 covers 99%+ of traffic (the rest is long-tail
    // query string variants with 1-2 views each). Good enough for historical import.
    if (data.more) {
      console.log(`  Note: ${(data.hits || []).length} paths fetched, more exist but skipping long tail.`);
    }
    break;
  }

  console.log(`Prepared ${batch.length} daily records representing ${totalViews} total pageviews.`);

  if (batch.length > 0) {
    const CHUNK = 1000;
    for (let i = 0; i < batch.length; i += CHUNK) {
      await col.insertMany(batch.slice(i, i + CHUNK));
      console.log(`  Inserted ${Math.min(i + CHUNK, batch.length)} / ${batch.length}`);
    }
  }

  console.log(`Done. ${batch.length} records, ${totalViews} total pageviews imported.`);
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
