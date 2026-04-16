import { NextRequest, NextResponse } from "next/server";
import { trackRequest } from "@/lib/track";

const MD_CONTENT = `# AI Inspector

AI Inspector is an open-source tool for tracking and analyzing requests from
Large Language Model (LLM) crawlers, traditional search bots, and human browsers.

## How It Works

Every request to this file is logged to a PostgreSQL database with rich
metadata — user agent, IP address, request headers, and a classification of
whether the caller appears to be an LLM crawler (such as GPTBot, ClaudeBot,
or PerplexityBot), a search engine crawler, an uptime monitor, or a real
human browser.

## Why Track LLM Crawlers?

LLMs increasingly crawl the web to build training datasets and power
retrieval-augmented generation (RAG) pipelines. Understanding which AI
systems access your content — and how often — provides valuable insight into
the AI-driven web.

## Statistics Captured

- User-Agent string and bot classification
- LLM provider (OpenAI, Anthropic, Google, Perplexity, …)
- IP address and geolocation
- Sec-Fetch headers (absent in bots)
- Referer, Accept, Accept-Language headers
- Response time

View the [live dashboard](/dashboard) to explore the data.
`;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const response = new NextResponse(MD_CONTENT, {
    status: 200,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });

  trackRequest(req, "md", Date.now() - start);

  return response;
}
