import { NextRequest } from "next/server";
import { pool } from "./db";
import { detectBot } from "./detect-bot";

export async function trackRequest(
  req: NextRequest,
  fileType: "html" | "md",
  responseTimeMs: number
): Promise<void> {
  try {
    const headers = req.headers;
    const ua = headers.get("user-agent");
    const bot = detectBot(ua);

    // Collect all raw headers as JSON (filter out sensitive cookies)
    const rawHeaders: Record<string, string> = {};
    headers.forEach((value, key) => {
      if (key.toLowerCase() !== "cookie" && key.toLowerCase() !== "authorization") {
        rawHeaders[key] = value;
      }
    });

    const url = new URL(req.url);

    await pool.query(
      `INSERT INTO request_logs (
        file_type, path, method, query_string,
        ip_address, x_forwarded_for, country_code, asn,
        user_agent,
        is_bot, is_llm_crawler, llm_provider, bot_name, bot_category,
        accept, accept_language, accept_encoding,
        referer, cache_control, connection_header,
        sec_fetch_site, sec_fetch_mode, sec_fetch_dest,
        response_time_ms, raw_headers
      ) VALUES (
        $1,  $2,  $3,  $4,
        $5,  $6,  $7,  $8,
        $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23,
        $24, $25
      )`,
      [
        fileType,
        url.pathname,
        req.method,
        url.search || null,

        // IP — trust X-Forwarded-For only if you control a trusted proxy
        headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
        headers.get("x-forwarded-for"),
        headers.get("cf-ipcountry") ?? headers.get("x-country-code") ?? null,
        headers.get("cf-asn") ?? null,

        ua,

        bot.isBot,
        bot.isLlmCrawler,
        bot.llmProvider,
        bot.botName,
        bot.botCategory,

        headers.get("accept"),
        headers.get("accept-language"),
        headers.get("accept-encoding"),
        headers.get("referer"),
        headers.get("cache-control"),
        headers.get("connection"),

        headers.get("sec-fetch-site"),
        headers.get("sec-fetch-mode"),
        headers.get("sec-fetch-dest"),

        responseTimeMs,
        JSON.stringify(rawHeaders),
      ]
    );
  } catch (err) {
    // Tracking failures must never break the response — log and continue
    console.error("[aiinspector] Failed to track request:", err);
  }
}
