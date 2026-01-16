-- ============================================================
-- Cron Job Execution Logs
-- Created: 2026-01-16
-- Purpose: Store cron job execution results for monitoring
-- ============================================================

-- Create cron_logs table
CREATE TABLE cron_logs (
  id BIGSERIAL PRIMARY KEY,

  -- Execution metadata
  job_name VARCHAR(100) NOT NULL DEFAULT 'collect-events',
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms INTEGER,

  -- Results
  success BOOLEAN NOT NULL,
  message TEXT,

  -- Statistics
  total_items INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  enriched_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Detailed info
  errors JSONB,
  metadata JSONB,

  -- Index for fast queries
  CONSTRAINT valid_counts CHECK (
    processed_count >= 0 AND
    enriched_count >= 0 AND
    skipped_count >= 0 AND
    error_count >= 0
  )
);

-- Indexes
CREATE INDEX idx_cron_logs_executed_at ON cron_logs (executed_at DESC);
CREATE INDEX idx_cron_logs_job_name ON cron_logs (job_name, executed_at DESC);
CREATE INDEX idx_cron_logs_success ON cron_logs (success, executed_at DESC);

-- Comments
COMMENT ON TABLE cron_logs IS 'Cron job 실행 결과 로그 (Vercel 로그 대체)';
COMMENT ON COLUMN cron_logs.job_name IS 'Cron job 이름';
COMMENT ON COLUMN cron_logs.executed_at IS '실행 시각';
COMMENT ON COLUMN cron_logs.duration_ms IS '실행 소요 시간 (밀리초)';
COMMENT ON COLUMN cron_logs.success IS '성공 여부';
COMMENT ON COLUMN cron_logs.processed_count IS '처리된 이벤트 수';
COMMENT ON COLUMN cron_logs.enriched_count IS 'AI enrichment 수행 수';
COMMENT ON COLUMN cron_logs.skipped_count IS '스킵된 이벤트 수 (비용 절감)';
COMMENT ON COLUMN cron_logs.errors IS '오류 상세 정보 (JSON 배열)';
