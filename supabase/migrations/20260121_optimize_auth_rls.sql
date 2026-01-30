-- ============================================================
-- Optimize Auth RLS Performance
-- Created: 2026-01-21
-- Purpose: Fix "Auth RLS Initialization Plan" warnings
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
-- ============================================================

-- Create optimized auth helper function
-- This function is marked as STABLE so PostgreSQL can cache the result per query
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::uuid;
$$;

-- Recreate profiles policies using optimized function
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.user_id() = id)
  WITH CHECK (auth.user_id() = id);

-- Recreate bookmarks policies using optimized function
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.user_id() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.user_id() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.user_id() = user_id);

-- Comments
COMMENT ON FUNCTION auth.user_id() IS 'Optimized auth.uid() replacement - marked as STABLE for better RLS performance';
