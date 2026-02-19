# RingMaBell

**Keep Your Dreams Alive** - 목표와 꿈을 추적하고, AI 기반 동기부여 알림을 받아보세요!

## 주요 기능

### Aspirations (목표 관리)
- 목표 생성, 수정, 삭제
- 마감일 설정
- 상태 관리 (active / completed / archived)

### Smart Alerts (스마트 알림)
- **점진적 알림 주기**: 마감일이 가까워질수록 알림 빈도 증가
  - 30일+ : 주 1회
  - 14-30일 : 3-4일마다
  - 3-14일 : 매일
  - 3일 이내/초과 : 하루 2회
- **AI 맞춤 메시지**: 목표 내용과 긴급도에 따른 동기부여 메시지 자동 생성

### Discord 연동
- Discord Webhook으로 알림 전송
- 설정에서 Webhook URL 등록 및 테스트

---

## 시작하기

### 1. 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 값을 채워주세요:

```bash
cp .env.example .env.local
```

```env
# Supabase - supabase.com > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# OpenAI - platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
```

### 2. Supabase 설정

Supabase SQL Editor에서 다음 마이그레이션을 실행하세요:

1. `aspirations` 테이블 (기본 테이블)
2. `user_settings` 테이블 (Discord 설정)
3. `alerts` 테이블: `tasks/supabase-alerts-migration.sql`

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인하세요.

---

## API 엔드포인트

### Aspirations
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/aspirations` | 목표 목록 조회 |
| POST | `/api/aspirations` | 새 목표 생성 |
| GET | `/api/aspirations/[id]` | 특정 목표 조회 |
| PATCH | `/api/aspirations/[id]` | 목표 수정 |
| DELETE | `/api/aspirations/[id]` | 목표 삭제 |
| POST | `/api/aspirations/[id]/remind` | AI 리마인더 생성 |

### Alerts
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/alerts` | 알림 목록 조회 |
| PATCH | `/api/alerts/[id]` | 알림 상태 업데이트 |
| POST | `/api/alerts/generate` | 알림 자동 생성 |
| POST | `/api/alerts/send-discord` | Discord로 알림 전송 |

### Settings
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/settings` | 사용자 설정 조회 |
| PUT | `/api/settings` | 설정 업데이트 |
| POST | `/api/settings/test-webhook` | Discord Webhook 테스트 |

---

## 자동 알림 설정 (Cron)

알림을 자동으로 생성하고 Discord로 전송하려면 Vercel Cron 또는 외부 크론 서비스를 설정하세요.

**권장 주기**: 12시간마다

```bash
# 알림 생성
curl -X POST https://your-domain.com/api/alerts/generate

# Discord 전송
curl -X POST https://your-domain.com/api/alerts/send-discord
```

---

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o-mini
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## 배포

Vercel에 배포하는 것을 권장합니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

환경 변수를 Vercel 프로젝트 설정에 추가하는 것을 잊지 마세요.

---

## 라이선스

Private Project
