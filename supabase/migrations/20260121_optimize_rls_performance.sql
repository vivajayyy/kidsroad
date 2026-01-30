-- ============================================================
-- Optimize RLS Performance
-- Created: 2026-01-21
-- Purpose: Improve RLS policy performance for profiles and bookmarks
-- ============================================================

-- Performance optimization for profiles RLS
-- Add index on id to speed up auth.uid() = id checks
-- (id is already PRIMARY KEY, so index exists - this is informational)

-- Performance optimization for bookmarks RLS
-- The existing indexes on user_id and event_id already help with RLS performance
-- bookmarks_user_id_idx already exists and will be used by auth.uid() = user_id

-- Alternative: Use more efficient RLS policies with explicit column references
-- This helps PostgreSQL query planner optimize better

-- Recreate profiles UPDATE policy with better optimization hints
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Recreate bookmarks policies with authenticated user role specification
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add composite index for common bookmark queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created
ON public.bookmarks(user_id, created_at DESC);

-- Analyze tables to update statistics for query planner
ANALYZE public.profiles;
ANALYZE public.bookmarks;

-- Comments
COMMENT ON INDEX idx_bookmarks_user_created IS 'Composite index for user bookmark listings (optimizes RLS + sorting)';
