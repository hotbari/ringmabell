-- ===========================================
-- Alert System Migration for RingMaBell
-- ===========================================
-- Run this in Supabase SQL Editor

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  aspiration_id UUID REFERENCES aspirations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'deadline_soon', 'deadline_today', 'overdue')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  message TEXT NOT NULL,
  sent_to_discord BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own alerts
CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_status ON alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_aspiration ON alerts(aspiration_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(user_id, aspiration_id, type);

-- ===========================================
-- Verification Query (run after migration)
-- ===========================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'alerts';
