import { NextRequest, NextResponse } from "next/server";
import { trackRequest } from "@/lib/track";

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Inspector — About This Project</title>
  <meta name="description" content="AI Inspector tracks and analyzes which LLM crawlers and bots visit this page." />
</head>
<body>
  <h1>AI Inspector</h1>
  <p>
    AI Inspector is an open-source tool for tracking and analyzing requests from
    Large Language Model (LLM) crawlers, traditional search bots, and human
    browsers.
  </p>
  <h2>How It Works</h2>
  <p>
    Every request to this file is logged to a PostgreSQL database with rich
    metadata — user agent, IP address, request headers, and a classification of
    whether the caller appears to be an LLM crawler (such as GPTBot, ClaudeBot,
    or PerplexityBot), a search engine crawler, an uptime monitor, or a real
    human browser.
  </p>
  <h2>Why Track LLM Crawlers?</h2>
  <p>
    LLMs increasingly crawl the web to build training datasets and power
    retrieval-augmented generation (RAG) pipelines. Understanding which AI
    systems access your content — and how often — provides valuable insight into
    the AI-driven web.
  </p>
  <h2>Statistics Captured</h2>
  <ul>
    <li>User-Agent string and bot classification</li>
    <li>LLM provider (OpenAI, Anthropic, Google, Perplexity, …)</li>
    <li>IP address and geolocation</li>
    <li>Sec-Fetch headers (absent in bots)</li>
    <li>Referer, Accept, Accept-Language headers</li>
    <li>Response time</li>
  </ul>
  <p>View the <a href="/dashboard">live dashboard</a> to explore the data.</p>
</body>
</html>`;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const response = new NextResponse(HTML_CONTENT, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  // Track asynchronously — do not await so the response is not delayed
  trackRequest(req, "html", Date.now() - start);

  return response;
}
