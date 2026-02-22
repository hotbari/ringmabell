# RingMaBell MVP Setup

## You Need
1. **Supabase account** (free) - for database + auth
2. **OpenAI API key** (you have this)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Choose a name and password, then create

## Step 2: Get Supabase Keys

1. Go to **Settings > API** in your project
2. Copy these values to `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Create Database Tables

1. Go to **SQL Editor** in Supabase
2. Paste this and click **Run**:

```sql
-- Create aspirations table
create table public.aspirations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  details text not null,
  deadline date,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.aspirations enable row level security;

-- Users can only see their own aspirations
create policy "Users can CRUD own aspirations" on public.aspirations
  for all using (auth.uid() = user_id);
```

## Step 4: Enable Google Login

1. Go to **Authentication > Providers > Google**
2. Toggle it ON
3. You need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

**Or skip Google and use Email login:**
- Go to **Authentication > Providers > Email**
- It's enabled by default

## Step 5: Fill .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-...
```

## Step 6: Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- Google login (or email)
- Create/edit/delete aspirations
- Mark as complete
- **Get AI Motivation** button generates personalized encouragement
