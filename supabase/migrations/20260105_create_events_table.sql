-- ============================================================
-- Kidsroad Events Table Schema (MVP)
-- Created: 2026-01-05
-- Purpose: Store festival/event data from TourAPI and other sources
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- Create events table
CREATE TABLE events (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- TourAPI Core Fields
  contentid VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  addr1 TEXT,
  addr2 TEXT,
  mapx DECIMAL(11, 8),
  mapy DECIMAL(10, 8),
  tel VARCHAR(50),
  firstimage TEXT,
  firstimage2 TEXT,
  eventstartdate DATE NOT NULL,
  eventenddate DATE NOT NULL,

  -- TourAPI Detail Fields
  eventplace TEXT,
  playtime TEXT,
  usetimefestival TEXT,
  createdtime TIMESTAMP,
  modifiedtime TIMESTAMP,

  -- Kidsroad Specialized Fields
  age_ranges TEXT[] DEFAULT '{}',
  is_indoor BOOLEAN,
  is_outdoor BOOLEAN,
  has_stroller_access BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  has_nursing_room BOOLEAN DEFAULT false,
  has_diaper_station BOOLEAN DEFAULT false,
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  description TEXT,

  -- System Fields
  data_source VARCHAR(50) DEFAULT 'TourAPI',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (eventstartdate <= eventenddate),
  CONSTRAINT valid_longitude CHECK (mapx IS NULL OR (mapx >= -180 AND mapx <= 180)),
  CONSTRAINT valid_latitude CHECK (mapy IS NULL OR (mapy >= -90 AND mapy <= 90))
);

-- ============================================================
-- Indexes for Performance
-- ============================================================

-- Date range queries (most common filter)
CREATE INDEX idx_events_date_range
ON events (eventstartdate, eventenddate)
WHERE is_published = true;

-- Location-based queries (requires earthdistance extension)
CREATE INDEX idx_events_location
ON events USING GIST (ll_to_earth(mapy, mapx))
WHERE mapx IS NOT NULL AND mapy IS NOT NULL AND is_published = true;

-- Age range array searches
CREATE INDEX idx_events_age_ranges
ON events USING GIN (age_ranges)
WHERE is_published = true;

-- Tag-based filtering
CREATE INDEX idx_events_tags
ON events USING GIN (tags)
WHERE is_published = true;

-- Full-text search on title and description
CREATE INDEX idx_events_fulltext
ON events USING GIN (to_tsvector('simple', title || ' ' || COALESCE(description, '')));

-- Category filtering
CREATE INDEX idx_events_category
ON events (category)
WHERE is_published = true AND category IS NOT NULL;

-- Composite index for common parent checklist combinations
CREATE INDEX idx_events_checklist
ON events (is_free, has_parking, has_stroller_access)
WHERE is_published = true;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to read published events
CREATE POLICY "Public events are viewable by everyone"
ON events
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Service role (backend scripts) has full access
CREATE POLICY "Service role has full access"
ON events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments for Documentation
-- ============================================================

COMMENT ON TABLE events IS 'Festival and event information from TourAPI and other sources';
COMMENT ON COLUMN events.contentid IS 'TourAPI unique identifier';
COMMENT ON COLUMN events.age_ranges IS 'Suitable age ranges: {0-2, 3-5, 6-9, 10+}';
COMMENT ON COLUMN events.is_published IS 'Admin control for hiding events';
