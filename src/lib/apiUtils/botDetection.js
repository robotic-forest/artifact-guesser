/**
 * User-agent based bot detection.
 *
 * Modeled on GoatCounter's `isbot` package: the single UA check is
 * the dominant signal for non-human traffic. We also flag empty or very
 * short UAs, and UAs lacking any real browser token.
 *
 * Returns a reason code ('' = human, else a short tag) so we can
 * audit how traffic is being classified.
 */

const BOT_PATTERNS = [
  // Explicit bot tokens
  /\bbot\b/i, /crawler/i, /crawling/i, /spider/i, /scraper/i,
  /slurp/i, /mediapartners/i, /adsbot/i, /feedfetcher/i, /facebookexternalhit/i,
  /facebot/i, /ia_archiver/i, /archive\.org_bot/i,

  // Specific known crawlers
  /googlebot/i, /bingbot/i, /yandex(bot|images|metrika)/i, /baiduspider/i,
  /duckduckbot/i, /applebot/i, /petalbot/i, /semrushbot/i, /ahrefsbot/i,
  /mj12bot/i, /dotbot/i, /seznambot/i, /exabot/i, /screaming frog/i,
  /sogou/i, /yeti/i, /linespider/i, /bytespider/i, /amazonbot/i,
  /claudebot/i, /gptbot/i, /chatgpt-user/i, /oai-searchbot/i, /perplexitybot/i,
  /anthropic-ai/i, /ccbot/i, /youbot/i,

  // Social / messaging link previewers
  /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i,
  /discordbot/i, /slackbot/i, /pinterestbot/i, /redditbot/i,
  /skypeuripreview/i, /vkshare/i,

  // Monitoring / uptime
  /uptimerobot/i, /pingdom/i, /statuscake/i, /new ?relic/i, /site24x7/i,

  // Headless / automation
  /headlesschrome/i, /headless/i, /phantomjs/i, /puppeteer/i, /playwright/i,
  /selenium/i, /electron/i, /cypress/i, /nightmare/i, /chrome-lighthouse/i,

  // HTTP client libraries (almost never real browsers)
  /^curl\//i, /^wget/i, /python-requests/i, /python-urllib/i, /python\//i,
  /go-http-client/i, /^java\//i, /okhttp/i, /apache-httpclient/i,
  /node-fetch/i, /axios\//i, /got\s*\(/i, /httpie/i, /libwww-perl/i,
  /ruby/i, /^rest-client/i, /guzzlehttp/i, /restsharp/i,

  // Link/feed checkers
  /validator/i, /checker/i, /w3c_/i, /linkcheck/i, /metainspector/i,
  /feedburner/i, /feedly/i, /newsblur/i, /inoreader/i,

  // Prefetchers / previewers
  /prerender/i, /phantomcrawl/i, /chromeframe/i, /lighthouse/i,
]

// Browser tokens — at least one should appear in a real browser UA
const BROWSER_TOKENS = /mozilla|opera|edge|chrome|safari|firefox|msie|trident/i

/**
 * @param {string|null|undefined} userAgent
 * @returns {{ isBot: boolean, reason: string }}
 */
export const detectBot = (userAgent) => {
  if (!userAgent) return { isBot: true, reason: 'empty-ua' }
  if (userAgent.length < 20) return { isBot: true, reason: 'short-ua' }

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, reason: 'ua-pattern' }
    }
  }

  if (!BROWSER_TOKENS.test(userAgent)) {
    return { isBot: true, reason: 'no-browser-token' }
  }

  return { isBot: false, reason: '' }
}
