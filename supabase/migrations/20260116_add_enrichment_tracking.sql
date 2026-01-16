-- ============================================================
-- Add Enrichment Tracking Fields
-- Created: 2026-01-16
-- Purpose: Track enrichment execution and confidence for smart re-analysis
-- ============================================================

-- Add enrichment tracking columns
ALTER TABLE events
ADD COLUMN last_enriched_at TIMESTAMPTZ,
ADD COLUMN enrichment_confidence DECIMAL(3,2) CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 1);

-- Index for efficient re-analysis queries
CREATE INDEX idx_events_enrichment_tracking
ON events (last_enriched_at, eventstartdate, eventenddate)
WHERE is_published = true;

-- Comments for documentation
COMMENT ON COLUMN events.last_enriched_at IS '마지막 enrichment 실행 시각 (블로그 크롤링 + AI 분석 완료 시점)';
COMMENT ON COLUMN events.enrichment_confidence IS 'AI 분석 신뢰도 (0.00~1.00, null=미분석 또는 실패)';
