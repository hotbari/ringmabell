-- RingMaBell Database Schema
-- Run this in Supabase SQL Editor

-- Create aspirations table
create table if not exists public.aspirations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  details text not null,
  deadline date,
  status text check (status in ('active', 'completed', 'archived')) default 'active',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create user settings table (for Discord webhook, etc.)
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  discord_webhook_url text,
  notification_enabled boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create reminders table (log of sent reminders)
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  aspiration_id uuid references public.aspirations(id) on delete cascade not null,
  content text not null,
  sent_to text default 'app', -- 'app', 'discord', 'both'
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.aspirations enable row level security;
alter table public.user_settings enable row level security;
alter table public.reminders enable row level security;

-- Aspirations policies
create policy "Users can view own aspirations" on public.aspirations for select using (auth.uid() = user_id);
create policy "Users can create own aspirations" on public.aspirations for insert with check (auth.uid() = user_id);
create policy "Users can update own aspirations" on public.aspirations for update using (auth.uid() = user_id);
create policy "Users can delete own aspirations" on public.aspirations for delete using (auth.uid() = user_id);

-- User settings policies
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can create own settings" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);

-- Reminders policies
create policy "Users can view own reminders" on public.reminders for select using (auth.uid() = user_id);
create policy "Users can create own reminders" on public.reminders for insert with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_aspirations_user_id on public.aspirations(user_id);
create index if not exists idx_reminders_user_id on public.reminders(user_id);
create index if not exists idx_reminders_created_at on public.reminders(created_at desc);
