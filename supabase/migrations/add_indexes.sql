-- Migration: Add database indexes for performance optimization
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- 
-- These indexes will significantly improve query performance, especially for:
-- - Tool lookups by slug
-- - Filtering by category
-- - Sorting by popularity

-- Index on tools.slug (unique, for fast lookups)
-- This is critical for tool detail page performance
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Index on tools.category (for filtering)
-- Speeds up category-based queries
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

-- Index on tools.popularity_score (for sorting)
-- Speeds up sorting by popularity (DESC order)
CREATE INDEX IF NOT EXISTS idx_tools_popularity ON tools(popularity_score DESC NULLS LAST);

-- Composite index for category + popularity (common query pattern)
-- This is the most important index for the tools listing page
-- When filtering by category and sorting by popularity
CREATE INDEX IF NOT EXISTS idx_tools_category_popularity ON tools(category, popularity_score DESC NULLS LAST);

-- Index on tools.created_at (for sorting by newest/oldest)
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

-- Index on tools.pricing_tier (for filtering by pricing)
CREATE INDEX IF NOT EXISTS idx_tools_pricing_tier ON tools(pricing_tier);

-- Index on tools.pricing_free (for filtering free tools)
CREATE INDEX IF NOT EXISTS idx_tools_pricing_free ON tools(pricing_free) WHERE pricing_free = true;

-- Index on categories.name (for category lookups)
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Verify indexes were created successfully
-- Run this query to see all indexes:
SELECT 
    schemaname,
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('tools', 'categories')
ORDER BY tablename, indexname;

-- Expected output should show all the indexes above
-- If any are missing, check for errors in the creation statements

-- Performance notes:
-- - These indexes will use some additional storage (~5-10MB for 157 tools)
-- - Write operations (INSERT/UPDATE) will be slightly slower, but reads will be much faster
-- - The composite index (category + popularity) is the most valuable for your use case
-- - Monitor query performance after adding indexes using EXPLAIN ANALYZE
