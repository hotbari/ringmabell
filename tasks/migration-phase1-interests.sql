-- ===========================================
-- Phase 1: Interest Analysis & Auto-Grouping Migration
-- ===========================================
-- Run this in Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add new columns to aspirations
ALTER TABLE aspirations
  ADD COLUMN IF NOT EXISTS life_domain TEXT CHECK (life_domain IN (
    'health', 'career', 'education', 'finance',
    'relationships', 'creativity', 'travel',
    'lifestyle', 'hobby', 'other'
  )),
  ADD COLUMN IF NOT EXISTS auto_tags TEXT[] DEFAULT '{}';

-- 3. Global interest dictionary
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('activity', 'skill', 'topic', 'place', 'experience', 'other')),
  parent_interest_id UUID REFERENCES interests(id) ON DELETE SET NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_interests_name ON interests(LOWER(name));

-- 4. User-interest connections
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  source_aspiration_id UUID REFERENCES aspirations(id) ON DELETE CASCADE NOT NULL,
  strength REAL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interests_unique ON user_interests(user_id, interest_id, source_aspiration_id);

-- 5. Interest edges (relationships between interests)
CREATE TABLE IF NOT EXISTS interest_edges (
  from_interest_id UUID REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  to_interest_id UUID REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT DEFAULT 'co_occurrence' CHECK (relationship_type IN ('co_occurrence', 'parent_child', 'similar')),
  weight REAL DEFAULT 0.5,
  co_occurrence_count INTEGER DEFAULT 1,
  PRIMARY KEY (from_interest_id, to_interest_id)
);

-- 6. Aspiration embeddings
CREATE TABLE IF NOT EXISTS aspiration_embeddings (
  aspiration_id UUID PRIMARY KEY REFERENCES aspirations(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Auto-generated groups
CREATE TABLE IF NOT EXISTS aspiration_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#FF4D8B',
  icon TEXT DEFAULT '🎯',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aspiration_groups_user ON aspiration_groups(user_id);

-- 8. Group membership
CREATE TABLE IF NOT EXISTS aspiration_group_members (
  aspiration_id UUID REFERENCES aspirations(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES aspiration_groups(id) ON DELETE CASCADE NOT NULL,
  similarity_score REAL DEFAULT 0.0,
  PRIMARY KEY (aspiration_id, group_id)
);

-- 9. Aspiration analysis cache
CREATE TABLE IF NOT EXISTS aspiration_analysis (
  aspiration_id UUID PRIMARY KEY REFERENCES aspirations(id) ON DELETE CASCADE,
  interests_extracted JSONB DEFAULT '[]',
  emotions TEXT[] DEFAULT '{}',
  values TEXT[] DEFAULT '{}',
  life_domain TEXT CHECK (life_domain IN (
    'health', 'career', 'education', 'finance',
    'relationships', 'creativity', 'travel',
    'lifestyle', 'hobby', 'other'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Recommendations log
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest_id UUID REFERENCES interests(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('similar', 'cross_user', 'personality')),
  reasoning TEXT,
  novelty_score REAL DEFAULT 0.5,
  user_response TEXT CHECK (user_response IN ('accepted', 'dismissed', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);

-- 11. Add analysis settings to user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS personality_analysis_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS recommendation_enabled BOOLEAN DEFAULT TRUE;

-- ===========================================
-- Row Level Security
-- ===========================================

-- Interests: public read, admin write
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read interests" ON interests FOR SELECT USING (true);

-- User interests: user-scoped
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own user_interests" ON user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_interests" ON user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_interests" ON user_interests FOR DELETE USING (auth.uid() = user_id);

-- Interest edges: public read
ALTER TABLE interest_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read interest_edges" ON interest_edges FOR SELECT USING (true);

-- Aspiration embeddings: user-scoped via aspirations join
ALTER TABLE aspiration_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own embeddings" ON aspiration_embeddings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM aspirations WHERE aspirations.id = aspiration_id AND aspirations.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own embeddings" ON aspiration_embeddings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM aspirations WHERE aspirations.id = aspiration_id AND aspirations.user_id = auth.uid())
  );

-- Aspiration groups: user-scoped
ALTER TABLE aspiration_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own groups" ON aspiration_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own groups" ON aspiration_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own groups" ON aspiration_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own groups" ON aspiration_groups FOR DELETE USING (auth.uid() = user_id);

-- Group members: access via group ownership
ALTER TABLE aspiration_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own group members" ON aspiration_group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM aspiration_groups WHERE aspiration_groups.id = group_id AND aspiration_groups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own group members" ON aspiration_group_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM aspiration_groups WHERE aspiration_groups.id = group_id AND aspiration_groups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own group members" ON aspiration_group_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM aspiration_groups WHERE aspiration_groups.id = group_id AND aspiration_groups.user_id = auth.uid())
  );

-- Aspiration analysis: user-scoped via aspirations join
ALTER TABLE aspiration_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analysis" ON aspiration_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM aspirations WHERE aspirations.id = aspiration_id AND aspirations.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own analysis" ON aspiration_analysis
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM aspirations WHERE aspirations.id = aspiration_id AND aspirations.user_id = auth.uid())
  );

-- Recommendations: user-scoped
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- Helper function: cosine similarity search
-- ===========================================
CREATE OR REPLACE FUNCTION match_aspirations(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold REAL DEFAULT 0.75,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  aspiration_id UUID,
  similarity REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.aspiration_id,
    (1 - (ae.embedding <=> query_embedding))::REAL AS similarity
  FROM aspiration_embeddings ae
  JOIN aspirations a ON a.id = ae.aspiration_id
  WHERE a.user_id = match_user_id
    AND (1 - (ae.embedding <=> query_embedding)) > match_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ===========================================
-- Verification
-- ===========================================
-- Run after migration:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
