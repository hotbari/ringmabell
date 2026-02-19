# Alert System Implementation

## Completed Tasks

- [x] Database: Create alerts table migration (`tasks/supabase-alerts-migration.sql`)
- [x] Types: Add Alert types to `/src/types/index.ts`
- [x] API: Create `/api/alerts` GET endpoint
- [x] API: Create `/api/alerts/[id]` PATCH endpoint
- [x] API: Create `/api/alerts/generate` endpoint
- [x] UI: Create AlertCard component
- [x] UI: Create AlertList component
- [x] UI: Update dashboard with tab navigation (Aspirations | Alerts)
- [x] Discord: Create SettingsModal for webhook URL configuration
- [x] Discord: Create `/api/alerts/send-discord` endpoint
- [x] Settings: Create `/api/settings` GET/PUT endpoints
- [x] Settings: Create `/api/settings/test-webhook` POST endpoint

## Files Created

### Database
- `/tasks/supabase-alerts-migration.sql` - Run this in Supabase SQL Editor

### API Routes
- `/src/app/api/alerts/route.ts` - GET all alerts
- `/src/app/api/alerts/[id]/route.ts` - PATCH alert status
- `/src/app/api/alerts/generate/route.ts` - Generate alerts from deadlines
- `/src/app/api/alerts/send-discord/route.ts` - Send to Discord webhook
- `/src/app/api/settings/route.ts` - GET/PUT user settings
- `/src/app/api/settings/test-webhook/route.ts` - Test Discord webhook

### Components
- `/src/components/alerts/AlertCard.tsx` - Individual alert card
- `/src/components/alerts/AlertList.tsx` - Alert list with filters
- `/src/components/dashboard/DashboardTabs.tsx` - Tab navigation
- `/src/components/dashboard/DashboardHeader.tsx` - Header with settings
- `/src/components/dashboard/SettingsModal.tsx` - Discord settings modal

### Modified Files
- `/src/types/index.ts` - Added Alert types
- `/src/app/dashboard/page.tsx` - Integrated alerts tab

## Verification Steps

1. **Run Migration**: Execute `tasks/supabase-alerts-migration.sql` in Supabase SQL Editor
2. **Test Alerts Generation**:
   - Create aspiration with deadline in 3 days
   - Call `POST /api/alerts/generate`
   - Verify alert appears in dashboard
3. **Test Mark Done**: Click "Done" button on alert
4. **Test Discord**:
   - Open Settings modal (gear icon)
   - Add Discord webhook URL
   - Click "Test Webhook" - verify message in Discord
   - Call `POST /api/alerts/send-discord` to send pending alerts

## Alert System Enhancement (Progressive Alerts + AI Messages)

### Completed
- [x] Types: Add `UrgencyLevel` type and update `AlertType` values
- [x] AI: Create `/src/lib/openai/alerts.ts` for AI message generation
- [x] API: Update `/api/alerts/generate` with progressive frequency logic
- [x] UI: Update AlertCard and send-discord with new AlertType values

### New Alert Frequency Rules

| Days Until Deadline | Frequency | Hours Between Alerts |
|---------------------|-----------|---------------------|
| 30+ days | Weekly | 168 hours |
| 14-30 days | Every 3.5 days | 84 hours |
| 3-14 days | Daily | 24 hours |
| 0-3 days or overdue | Twice daily | 12 hours |

### New AlertType Values
- `reminder` - General periodic reminder (30+ days)
- `deadline_soon` - Approaching deadline (3 days or less)
- `deadline_today` - Deadline is today
- `overdue` - Past deadline

### AI Message Strategy by Urgency
- `low` (30+ days): Calm, encouraging, long-term perspective
- `medium` (7-30 days): Progress check-in, small action suggestions
- `high` (3-7 days): Urgency emphasis, concrete actions
- `critical` (<=3 days or overdue): Direct call-to-action, immediate steps

---

## Review

### What Works
- Full CRUD for alerts
- Dashboard tabs with unread badge
- Alert filtering (All/Pending/Done)
- Discord webhook configuration and testing
- Progressive alert generation based on deadline proximity
- AI-generated personalized messages based on aspiration content and urgency
- Time-based deduplication (checks last alert timestamp, not just existence)

### Architecture Notes
- Alerts are user-scoped with RLS
- Discord integration is optional (user configures webhook)
- Alert generation runs automatically via Vercel Cron (every 12 hours)
- Discord notifications sent 5 minutes after alert generation

### Vercel Cron Jobs
- [x] `/api/cron/generate-alerts` - Runs at 00:00, 12:00 UTC
- [x] `/api/cron/send-discord` - Runs at 00:05, 12:05 UTC

### Environment Variables Required
```
CRON_SECRET=<random-secret-for-cron-auth>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
```
