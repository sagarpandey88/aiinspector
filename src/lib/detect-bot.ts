export interface BotInfo {
  isBot: boolean;
  isLlmCrawler: boolean;
  llmProvider: string | null;
  botName: string | null;
  botCategory: "llm" | "search" | "monitor" | "scraper" | "browser" | null;
}

// Known LLM / AI crawlers  (user-agent substring → provider name)
const LLM_CRAWLERS: Array<{ pattern: RegExp; name: string; provider: string }> =
  [
    { pattern: /GPTBot/i,             name: "GPTBot",           provider: "OpenAI" },
    { pattern: /ChatGPT-User/i,       name: "ChatGPT-User",     provider: "OpenAI" },
    { pattern: /OAI-SearchBot/i,      name: "OAI-SearchBot",    provider: "OpenAI" },
    { pattern: /anthropic-ai/i,       name: "anthropic-ai",     provider: "Anthropic" },
    { pattern: /ClaudeBot/i,          name: "ClaudeBot",        provider: "Anthropic" },
    { pattern: /Claude-Web/i,         name: "Claude-Web",       provider: "Anthropic" },
    { pattern: /PerplexityBot/i,      name: "PerplexityBot",    provider: "Perplexity" },
    { pattern: /Google-Extended/i,    name: "Google-Extended",  provider: "Google" },
    { pattern: /Gemini/i,             name: "Gemini",           provider: "Google" },
    { pattern: /Bard/i,               name: "Bard",             provider: "Google" },
    { pattern: /YouBot/i,             name: "YouBot",           provider: "You.com" },
    { pattern: /cohere-ai/i,          name: "cohere-ai",        provider: "Cohere" },
    { pattern: /Meta-ExternalAgent/i, name: "Meta-ExternalAgent", provider: "Meta" },
    { pattern: /FacebookBot/i,        name: "FacebookBot",      provider: "Meta" },
    { pattern: /Applebot-Extended/i,  name: "Applebot-Extended", provider: "Apple" },
    { pattern: /Bytespider/i,         name: "Bytespider",       provider: "ByteDance" },
    { pattern: /iaskspider/i,         name: "iaskspider",       provider: "iAsk.Ai" },
    { pattern: /DuckAssistBot/i,      name: "DuckAssistBot",    provider: "DuckDuckGo" },
    { pattern: /Amazonbot/i,          name: "Amazonbot",        provider: "Amazon" },
    { pattern: /magpie-crawler/i,     name: "magpie-crawler",   provider: "Magpie" },
    { pattern: /omgili/i,             name: "omgili",           provider: "Omgili" },
    { pattern: /Diffbot/i,            name: "Diffbot",          provider: "Diffbot" },
  ];

// Known general-purpose search / other bots
const SEARCH_BOTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /Googlebot/i,  name: "Googlebot" },
  { pattern: /bingbot/i,    name: "Bingbot" },
  { pattern: /Slurp/i,      name: "YahooSlurp" },
  { pattern: /DuckDuckBot/i, name: "DuckDuckBot" },
  { pattern: /Baiduspider/i, name: "Baiduspider" },
  { pattern: /YandexBot/i,  name: "YandexBot" },
  { pattern: /Sogou/i,      name: "Sogou" },
  { pattern: /Exabot/i,     name: "Exabot" },
  { pattern: /facebot/i,    name: "Facebot" },
  { pattern: /ia_archiver/i, name: "Wayback" },
];

const MONITOR_BOTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /Pingdom/i,      name: "Pingdom" },
  { pattern: /UptimeRobot/i,  name: "UptimeRobot" },
  { pattern: /StatusCake/i,   name: "StatusCake" },
  { pattern: /NewRelic/i,     name: "NewRelic" },
  { pattern: /Datadog/i,      name: "Datadog" },
];

const SCRAPER_BOTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /SemrushBot/i,   name: "SemrushBot" },
  { pattern: /AhrefsBot/i,    name: "AhrefsBot" },
  { pattern: /MJ12bot/i,      name: "MJ12bot" },
  { pattern: /DotBot/i,       name: "DotBot" },
  { pattern: /PetalBot/i,     name: "PetalBot" },
];

export function detectBot(userAgent: string | null): BotInfo {
  if (!userAgent) {
    return { isBot: true, isLlmCrawler: false, llmProvider: null, botName: "NoUA", botCategory: "scraper" };
  }

  // Check LLM crawlers first (highest priority)
  for (const crawler of LLM_CRAWLERS) {
    if (crawler.pattern.test(userAgent)) {
      return {
        isBot: true,
        isLlmCrawler: true,
        llmProvider: crawler.provider,
        botName: crawler.name,
        botCategory: "llm",
      };
    }
  }

  for (const bot of SEARCH_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, isLlmCrawler: false, llmProvider: null, botName: bot.name, botCategory: "search" };
    }
  }

  for (const bot of MONITOR_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, isLlmCrawler: false, llmProvider: null, botName: bot.name, botCategory: "monitor" };
    }
  }

  for (const bot of SCRAPER_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, isLlmCrawler: false, llmProvider: null, botName: bot.name, botCategory: "scraper" };
    }
  }

  // Generic heuristic: common bot keywords
  if (/bot|crawl|spider|slurp|fetch|scan|scrape|index/i.test(userAgent)) {
    return { isBot: true, isLlmCrawler: false, llmProvider: null, botName: null, botCategory: "scraper" };
  }

  return { isBot: false, isLlmCrawler: false, llmProvider: null, botName: null, botCategory: "browser" };
}
