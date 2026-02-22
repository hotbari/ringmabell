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
- Alert generation is manual (call `/api/alerts/generate`)
- For automatic generation, set up Vercel Cron to call the endpoint every 12 hours

---

## 전체 테스트 & 디버깅 (2026-02-22 세션)

### 완료된 수정 사항

#### 빌드 에러 수정 (3건)
- [x] `src/app/api/cron/reminders/route.ts` 삭제 — 존재하지 않는 함수(`generateSearchQuery`, `searchWithTavily`) import + `resend` 의존성(`fast-sha256`, `uuid`) 누락. 알림 시스템(`cron/generate-alerts` + `cron/send-discord`)으로 이미 대체된 구 코드
- [x] `src/components/AspirationCard.tsx` 삭제 — 이전 세션 UI 계획 마크다운이 .tsx로 잘못 저장됨. 실제 컴포넌트는 `src/components/aspirations/AspirationCard.tsx`
- [x] `src/types/index.ts` — `Feedback` 인터페이스 중복 선언 제거 (line 33-39 삭제, line 177-183 유지)

#### 코드 이슈 수정 (8건)
- [x] **[HIGH]** `src/app/api/aspirations/route.ts:69-74` — fire-and-forget `Promise.all` → `await` 처리 (서버리스 환경에서 분석/임베딩 작업 완료 보장)
- [x] **[HIGH]** `src/app/api/aspirations/[id]/route.ts:68-73` — 동일 fire-and-forget → `await` 처리
- [x] **[MEDIUM]** `src/app/api/aspirations/[id]/route.ts:53-56` — `...body` spread → 허용 필드(`title`, `details`, `deadline`, `status`)만 명시적 pick (임의 컬럼 인젝션 방지)
- [x] **[MEDIUM]** `src/app/api/feedback/route.ts:53-72` — Discord 웹훅 fire-and-forget `fetch()` → `await` 처리
- [x] **[MEDIUM]** `src/app/api/alerts/generate/route.ts:4,123` — 미사용 `getUrgencyLevel` import 및 호출 제거
- [x] **[LOW]** `src/lib/openai/grouping.ts:76,157` — `clusterBySimlarity` → `clusterBySimilarity` 오타 수정
- [x] **[LOW]** `src/app/dashboard/page.tsx:18` — 그룹 멤버 Supabase 쿼리에 `!inner` 조인 추가 (다른 유저 그룹 데이터 누출 방지)
- [x] **[LOW]** `src/app/api/cron/generate-alerts/route.ts:4` — 미사용 `getUrgencyLevel` import 제거

#### 마스코트 이미지 교체
- [x] `src/components/HamburgerMascot.tsx` — SVG → `public/Photoroom.png` 이미지로 교체 (이름: 햄댕치)
- [x] `src/app/page.tsx:75` — `/hamdang.png` → `/Photoroom.png`, alt="햄댕치"
- [x] `src/components/dashboard/DashboardTabs.tsx:152` — 동일 교체

### 완료된 테스트

#### 1. 빌드 테스트 — PASS
- `npx next build` 성공 (에러 0, 경고: middleware deprecation만)

#### 2. 인증/라우트 보호 (7건) — 전부 PASS
- `GET /` → 200 (랜딩 페이지)
- `GET /login` → 200
- `GET /dashboard` → 307 → `/login` (미인증 시 보호)
- `GET /new` → 307 → `/login`
- `GET /api/aspirations` → 401 `{"error":"Unauthorized"}`
- `GET /api/alerts` → 401 `{"error":"Unauthorized"}`
- `POST /api/auth/signout` → 302 → `/` (GET은 405)

#### 3. Cron 인증 — PASS
- `GET /api/cron/generate-alerts` + 잘못된 Bearer → 401

### 남은 테스트 (미완료)

#### 4. UI 컴포넌트 검증
- [ ] `src/app/aspirations/[id]/page.tsx` — 상세 페이지
- [ ] `MotivationButton.tsx`, `StatusToggle.tsx`, `DeleteButton.tsx` — 상호작용
- [ ] `AspirationCard.tsx`, `AspirationForm.tsx` — 카드/폼
- [ ] `AlertCard.tsx`, `AlertList.tsx` — 알림 UI
- [ ] `DashboardHeader.tsx`, `DashboardTabs.tsx` — 대시보드
- [ ] `SettingsModal.tsx`, `FeedbackModal.tsx` — 모달
- [ ] `login/page.tsx`, `new/page.tsx` — 페이지

#### 5. Discord 연동 테스트
- [ ] 웹훅 URL 저장/테스트/발송
- [ ] 잘못된 URL, 미설정 상태 에지 케이스

#### 6. Phase 1 — 관심사 추출 & 그룹핑 테스트
- [ ] 목표 생성 시 자동 분석 동작 확인
- [ ] 유사 목표 그룹핑 (코사인 유사도 ≥ 0.75)
- [ ] 그룹 미생성 엣지 케이스 (1개, 유사도 낮음)
- [ ] 분석 요약 API

#### 7. 피드백 & PWA 테스트
- [ ] 피드백 제출 (별점 + 코멘트)
- [ ] PWA 설치, Service Worker
- [ ] 햄댕치 이미지 로딩 확인

### 미수정 알려진 이슈 (LOW 심각도)

- `src/app/api/alerts/send-discord/route.ts:63` — `alert.aspiration?.title` 접근 방식이 cron 버전(`[0]?.title`)과 불일치. FK 설정에 따라 정상일 수 있으나 확인 필요
- `src/app/api/settings/route.ts:42-73` — 수동 check-then-insert 패턴에 레이스 컨디션 가능성. `upsert()` 전환 권장
- `src/app/api/analysis/route.ts:57,65` — jsonb 컬럼에 `as string[]` 캐스트. `Array.isArray()` 방어 코드 권장
- `vercel.json` — `cron/send-discord` 라우트 미등록 (generate-alerts 내부에서 호출하므로 기능상 문제 없음)
- `src/lib/supabase/middleware.ts:37` — 미들웨어 보호 라우트가 화이트리스트 방식. 신규 페이지 추가 시 수동 등록 필요
