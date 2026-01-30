-- ============================================================
-- Fix Security Issues
-- Created: 2026-01-21
-- Purpose: Resolve Supabase security warnings
-- ============================================================

-- 1. Move extensions from public schema to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move earthdistance and cube to extensions schema
DROP EXTENSION IF EXISTS earthdistance CASCADE;
DROP EXTENSION IF EXISTS cube CASCADE;

CREATE EXTENSION IF NOT EXISTS cube SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS earthdistance SCHEMA extensions;

-- Grant usage to public
GRANT USAGE ON SCHEMA extensions TO public;

-- 2. Fix search_path vulnerability in handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 3. Fix search_path vulnerability in update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Recreate location index using extensions schema
DROP INDEX IF EXISTS idx_events_location;
CREATE INDEX idx_events_location
ON events USING GIST (extensions.ll_to_earth(mapy, mapx))
WHERE mapx IS NOT NULL AND mapy IS NOT NULL AND is_published = true;

-- Comments
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions (security best practice)';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-create profile on user signup (search_path secured)';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Auto-update updated_at timestamp (search_path secured)';
