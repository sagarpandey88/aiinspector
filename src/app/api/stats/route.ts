import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export interface StatsResponse {
  summary: {
    total: number;
    llm: number;
    bots: number;
    humans: number;
    htmlRequests: number;
    mdRequests: number;
  };
  byLlmProvider: Array<{ llm_provider: string; count: number }>;
  byBotCategory: Array<{ bot_category: string; count: number }>;
  byFileType: Array<{ file_type: string; is_llm_crawler: boolean; count: number }>;
  topUserAgents: Array<{ user_agent: string; count: number }>;
  recentRequests: Array<{
    id: number;
    timestamp: string;
    file_type: string;
    ip_address: string;
    user_agent: string;
    is_llm_crawler: boolean;
    llm_provider: string | null;
    bot_name: string | null;
    bot_category: string | null;
    country_code: string | null;
    sec_fetch_site: string | null;
    response_time_ms: number | null;
  }>;
  requestsOverTime: Array<{ hour: string; llm: number; bot: number; human: number }>;
}

export async function GET(): Promise<NextResponse> {
  console.log('[aiinspector] GET /api/stats invoked');
  try {
    const [
      summaryResult,
      byLlmProvider,
      byBotCategory,
      byFileType,
      topUserAgents,
      recentRequests,
      requestsOverTime,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int                                          AS total,
          COUNT(*) FILTER (WHERE is_llm_crawler)::int           AS llm,
          COUNT(*) FILTER (WHERE is_bot AND NOT is_llm_crawler)::int AS bots,
          COUNT(*) FILTER (WHERE NOT is_bot)::int               AS humans,
          COUNT(*) FILTER (WHERE file_type = 'html')::int       AS "htmlRequests",
          COUNT(*) FILTER (WHERE file_type = 'md')::int         AS "mdRequests"
        FROM request_logs
      `),
      pool.query(`
        SELECT llm_provider, COUNT(*)::int AS count
        FROM request_logs
        WHERE is_llm_crawler = TRUE AND llm_provider IS NOT NULL
        GROUP BY llm_provider
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT COALESCE(bot_category, 'unknown') AS bot_category, COUNT(*)::int AS count
        FROM request_logs
        GROUP BY bot_category
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT file_type, is_llm_crawler, COUNT(*)::int AS count
        FROM request_logs
        GROUP BY file_type, is_llm_crawler
        ORDER BY file_type, is_llm_crawler DESC
      `),
      pool.query(`
        SELECT COALESCE(user_agent, '(none)') AS user_agent, COUNT(*)::int AS count
        FROM request_logs
        GROUP BY user_agent
        ORDER BY count DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT id, timestamp, file_type, ip_address, user_agent,
               is_llm_crawler, llm_provider, bot_name, bot_category,
               country_code, sec_fetch_site, response_time_ms
        FROM request_logs
        ORDER BY timestamp DESC
        LIMIT 50
      `),
      pool.query(`
        SELECT
          date_trunc('hour', timestamp) AS hour,
          COUNT(*) FILTER (WHERE is_llm_crawler)::int              AS llm,
          COUNT(*) FILTER (WHERE is_bot AND NOT is_llm_crawler)::int AS bot,
          COUNT(*) FILTER (WHERE NOT is_bot)::int                   AS human
        FROM request_logs
        WHERE timestamp > NOW() - INTERVAL '48 hours'
        GROUP BY hour
        ORDER BY hour ASC
      `),
    ]);

    const body: StatsResponse = {
      summary: summaryResult.rows[0],
      byLlmProvider: byLlmProvider.rows,
      byBotCategory: byBotCategory.rows,
      byFileType: byFileType.rows,
      topUserAgents: topUserAgents.rows,
      recentRequests: recentRequests.rows,
      requestsOverTime: requestsOverTime.rows,
    };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[aiinspector] Stats query failed:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  console.log('[aiinspector] DELETE /api/stats invoked');
  try {
    // Remove all request logs and reset serial IDs so dashboard shows fresh hits
    await pool.query(`TRUNCATE TABLE request_logs RESTART IDENTITY`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[aiinspector] Failed to clear request_logs:", err);
    return NextResponse.json({ error: "Could not clear database" }, { status: 500 });
  }
}
