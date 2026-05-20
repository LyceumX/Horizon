-- Migration: add site column to planner_profiles
-- Date: 2026-05-20
-- Purpose: track whether a user profile belongs to the CN or Global site
-- DO NOT apply manually — applied via Supabase MCP by Ian

ALTER TABLE planner_profiles
ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'global'
CHECK (site IN ('cn', 'global'));
