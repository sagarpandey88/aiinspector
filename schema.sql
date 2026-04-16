-- Run this once against your PostgreSQL database to create the tracking table.
-- psql -U aiinspector -d aiinspector -f schema.sql





CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS request_logs (
  id                BIGSERIAL PRIMARY KEY,
  request_id        UUID NOT NULL DEFAULT gen_random_uuid(),
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- What was requested
  file_type         VARCHAR(10)  NOT NULL,   -- 'html' | 'md'
  path              TEXT         NOT NULL,
  method            VARCHAR(10)  NOT NULL,
  query_string      TEXT,

  -- Caller identity
  ip_address        TEXT,
  x_forwarded_for   TEXT,
  country_code      VARCHAR(10),             -- from CF-IPCountry / X-Country-Code
  asn               TEXT,                    -- from CF-ASN or similar

  -- User-Agent analysis
  user_agent        TEXT,
  is_bot            BOOLEAN NOT NULL DEFAULT FALSE,
  is_llm_crawler    BOOLEAN NOT NULL DEFAULT FALSE,
  llm_provider      VARCHAR(100),            -- 'OpenAI' | 'Anthropic' | 'Google' | …
  bot_name          VARCHAR(100),            -- e.g. 'GPTBot'
  bot_category      VARCHAR(50),             -- 'llm' | 'search' | 'monitor' | 'scraper' | 'browser'

  -- Standard request headers
  accept            TEXT,
  accept_language   TEXT,
  accept_encoding   TEXT,
  referer           TEXT,
  cache_control     TEXT,
  connection_header TEXT,

  -- Sec-Fetch headers (absent in bots / LLM crawlers)
  sec_fetch_site    TEXT,
  sec_fetch_mode    TEXT,
  sec_fetch_dest    TEXT,

  -- Performance
  response_time_ms  INTEGER,

  -- Full raw headers for forensics
  raw_headers       JSONB
);

CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp      ON request_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_is_llm         ON request_logs (is_llm_crawler);
CREATE INDEX IF NOT EXISTS idx_request_logs_file_type      ON request_logs (file_type);
CREATE INDEX IF NOT EXISTS idx_request_logs_llm_provider   ON request_logs (llm_provider);
CREATE INDEX IF NOT EXISTS idx_request_logs_ip             ON request_logs (ip_address);
