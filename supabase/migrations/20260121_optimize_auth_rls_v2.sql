-- ============================================================
-- Optimize Auth RLS Performance (v2)
-- Created: 2026-01-21
-- Purpose: Fix "Auth RLS Initialization Plan" warnings
-- Note: Use public schema instead of auth schema (permission issue)
-- ============================================================

-- Create optimized auth helper function in public schema
-- This function is marked as STABLE so PostgreSQL can cache the result per query
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon;

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
  USING (public.current_user_id() = id)
  WITH CHECK (public.current_user_id() = id);

-- Recreate bookmarks policies using optimized function
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (public.current_user_id() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_id() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (public.current_user_id() = user_id);

-- Comments
COMMENT ON FUNCTION public.current_user_id() IS 'Optimized wrapper for auth.uid() - marked as STABLE for better RLS performance';
