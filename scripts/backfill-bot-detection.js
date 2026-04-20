/**
 * Backfill isBot flag on existing analyticsEvents.
 *
 * Runs the same detectBot logic used at ingest against every event that
 * doesn't already have an isBot field. GoatCounter-imported events have
 * no userAgent (count.js doesn't expose it), so they're left untouched —
 * GC already filtered those.
 *
 * Run: node scripts/backfill-bot-detection.js [--dry]
 */

const { MongoClient } = require('mongodb');
const { readFileSync } = require('fs');
const { resolve } = require('path');

try {
  readFileSync(resolve(__dirname, '../.env'), 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^(\w+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch {}

// Inline bot detector — mirrors src/lib/apiUtils/botDetection.js
const BOT_PATTERNS = [
  /\bbot\b/i, /crawler/i, /crawling/i, /spider/i, /scraper/i,
  /slurp/i, /mediapartners/i, /adsbot/i, /feedfetcher/i, /facebookexternalhit/i,
  /facebot/i, /ia_archiver/i, /archive\.org_bot/i,
  /googlebot/i, /bingbot/i, /yandex(bot|images|metrika)/i, /baiduspider/i,
  /duckduckbot/i, /applebot/i, /petalbot/i, /semrushbot/i, /ahrefsbot/i,
  /mj12bot/i, /dotbot/i, /seznambot/i, /exabot/i, /screaming frog/i,
  /sogou/i, /yeti/i, /linespider/i, /bytespider/i, /amazonbot/i,
  /claudebot/i, /gptbot/i, /chatgpt-user/i, /oai-searchbot/i, /perplexitybot/i,
  /anthropic-ai/i, /ccbot/i, /youbot/i,
  /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i,
  /discordbot/i, /slackbot/i, /pinterestbot/i, /redditbot/i,
  /skypeuripreview/i, /vkshare/i,
  /uptimerobot/i, /pingdom/i, /statuscake/i, /new ?relic/i, /site24x7/i,
  /headlesschrome/i, /headless/i, /phantomjs/i, /puppeteer/i, /playwright/i,
  /selenium/i, /electron/i, /cypress/i, /nightmare/i, /chrome-lighthouse/i,
  /^curl\//i, /^wget/i, /python-requests/i, /python-urllib/i, /python\//i,
  /go-http-client/i, /^java\//i, /okhttp/i, /apache-httpclient/i,
  /node-fetch/i, /axios\//i, /got\s*\(/i, /httpie/i, /libwww-perl/i,
  /ruby/i, /^rest-client/i, /guzzlehttp/i, /restsharp/i,
  /validator/i, /checker/i, /w3c_/i, /linkcheck/i, /metainspector/i,
  /feedburner/i, /feedly/i, /newsblur/i, /inoreader/i,
  /prerender/i, /phantomcrawl/i, /chromeframe/i, /lighthouse/i,
];
const BROWSER_TOKENS = /mozilla|opera|edge|chrome|safari|firefox|msie|trident/i;

const detectBot = (ua) => {
  if (!ua) return { isBot: true, reason: 'empty-ua' };
  if (ua.length < 20) return { isBot: true, reason: 'short-ua' };
  for (const p of BOT_PATTERNS) if (p.test(ua)) return { isBot: true, reason: 'ua-pattern' };
  if (!BROWSER_TOKENS.test(ua)) return { isBot: true, reason: 'no-browser-token' };
  return { isBot: false, reason: '' };
};

async function main() {
  const dry = process.argv.includes('--dry');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DATABASE || 'production');
  const col = db.collection('analyticsEvents');

  const cursor = col.find({
    isBot: { $exists: false },
    source: { $ne: 'goatcounter' }, // GC imports have no UA; leave as-is
  });

  let human = 0, bot = 0, scanned = 0;
  const ops = [];
  const reasons = {};

  for await (const ev of cursor) {
    scanned++;
    const { isBot, reason } = detectBot(ev.userAgent);
    if (isBot) {
      bot++;
      reasons[reason] = (reasons[reason] || 0) + 1;
    } else {
      human++;
    }
    ops.push({
      updateOne: {
        filter: { _id: ev._id },
        update: { $set: { isBot, botReason: reason || null } },
      },
    });

    if (ops.length >= 1000) {
      if (!dry) await col.bulkWrite(ops);
      ops.length = 0;
      console.log(`  Processed ${scanned}...`);
    }
  }
  if (ops.length && !dry) await col.bulkWrite(ops);

  console.log(`\nScanned: ${scanned}`);
  console.log(`Human: ${human}`);
  console.log(`Bot: ${bot}`);
  console.log('Bot reasons:', reasons);
  if (dry) console.log('\n(dry run — no writes)');

  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
