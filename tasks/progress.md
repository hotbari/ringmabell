# RingMaBell 프로젝트 진행 현황

> 최종 업데이트: 2026-02-22

---

## 전체 진행 요약

| 단계 | 이름 | 상태 | 진행률 |
|------|------|------|--------|
| 기초 | 핵심 기능 (CRUD, 인증, UI) | **완료** | 100% |
| 알림 시스템 | 스마트 알림 + Discord 연동 | **완료** | 100% |
| Phase 1 | 관심사 추출 + 자동 그룹핑 기반 | **완료** | 100% |
| Phase 2 | 인텔리전스 (그래프, 프로필, 추천) | 미착수 | 0% |
| Phase 3 | 성장 (주간 인사이트, 뱃지) | 미착수 | 0% |
| Phase 4 | 스케일 (소셜, B2B, 컴플라이언스) | 미착수 | 0% |

---

## 완료된 작업

### 1. 핵심 기능 (기초)

- [x] Supabase Auth 기반 회원가입/로그인 (이메일+비밀번호)
- [x] 미들웨어 세션 관리 + 보호 라우트
- [x] 목표(Aspiration) CRUD API + UI
- [x] 목표 상세 페이지 (수정, 삭제, 상태 토글)
- [x] 대시보드 (목표 그리드, 진행중/완료 분리)
- [x] 랜딩 페이지 (히어로 + 기능 소개 카드)
- [x] PWA 지원 (next-pwa, Service Worker)
- [x] AI 동기부여 메시지 (햄댕치 캐릭터, GPT-4o-mini)
- [x] 재사용 UI 컴포넌트 (Button, Input, Textarea, Card)

**관련 파일:**
| 파일 | 역할 |
|------|------|
| `src/app/page.tsx` | 랜딩 페이지 |
| `src/app/login/page.tsx` | 로그인/회원가입 |
| `src/app/dashboard/page.tsx` | 대시보드 |
| `src/app/new/page.tsx` | 새 목표 생성 |
| `src/app/aspirations/[id]/page.tsx` | 목표 상세 |
| `src/app/api/aspirations/route.ts` | 목표 CRUD API |
| `src/app/api/aspirations/[id]/route.ts` | 목표 개별 API |
| `src/app/api/aspirations/[id]/remind/route.ts` | AI 리마인더 생성 |
| `src/lib/openai/client.ts` | 동기부여 메시지 생성 |
| `src/lib/supabase/client.ts` | 브라우저 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | 서버 Supabase 클라이언트 |
| `src/lib/supabase/admin.ts` | 관리자 Supabase 클라이언트 |
| `src/middleware.ts` | 인증 미들웨어 |
| `supabase/schema.sql` | 기본 DB 스키마 |

---

### 2. 알림 시스템

- [x] 알림 테이블 + RLS 마이그레이션
- [x] 점진적 알림 빈도 (마감일 거리에 따라 주간 -> 3.5일 -> 매일 -> 하루 2회)
- [x] 긴급도별 AI 메시지 생성 (low/medium/high/critical)
- [x] 알림 목록 + 필터링 (전체/대기중/완료)
- [x] 알림 상태 업데이트 (대기 -> 완료)
- [x] Discord 웹훅 연동 (설정, 테스트, 발송)
- [x] Vercel Cron 자동화 (12시간 간격)
- [x] 대시보드 알림 탭 + 미확인 뱃지
- [x] 유저 피드백 시스템 (별점 + 코멘트)

**관련 파일:**
| 파일 | 역할 |
|------|------|
| `src/app/api/alerts/route.ts` | 알림 목록 조회 |
| `src/app/api/alerts/[id]/route.ts` | 알림 상태 업데이트 |
| `src/app/api/alerts/generate/route.ts` | 알림 자동 생성 |
| `src/app/api/alerts/send-discord/route.ts` | Discord 발송 |
| `src/app/api/cron/generate-alerts/route.ts` | Cron: 알림 생성 |
| `src/app/api/cron/send-discord/route.ts` | Cron: Discord 발송 |
| `src/app/api/settings/route.ts` | 유저 설정 CRUD |
| `src/app/api/settings/test-webhook/route.ts` | 웹훅 테스트 |
| `src/app/api/feedback/route.ts` | 피드백 수집 |
| `src/lib/openai/alerts.ts` | 긴급도별 AI 알림 메시지 |
| `src/lib/discord/client.ts` | Discord 웹훅 헬퍼 |
| `src/components/alerts/AlertCard.tsx` | 알림 카드 |
| `src/components/alerts/AlertList.tsx` | 알림 리스트 |
| `src/components/dashboard/DashboardHeader.tsx` | 헤더 (알림벨, 설정) |
| `src/components/dashboard/DashboardTabs.tsx` | 탭 네비게이션 |
| `src/components/dashboard/SettingsModal.tsx` | Discord 설정 모달 |
| `src/components/dashboard/FeedbackModal.tsx` | 피드백 모달 |
| `tasks/supabase-alerts-migration.sql` | 알림 테이블 마이그레이션 |

---

### 3. Phase 1: 관심사 추출 + 자동 그룹핑 기반

- [x] pgvector 확장 + 신규 테이블 8개 마이그레이션
- [x] 타입 정의 추가 (Interest, AspirationGroup, AspirationAnalysis 등 12개)
- [x] 임베딩 유틸리티 (text-embedding-3-small, 1536차원)
- [x] 관심사/감정/가치관 추출 모듈 (GPT-4o-mini JSON 구조화)
- [x] 목표 생성 API에 자동 분석 훅 연결 (fire-and-forget)
- [x] 목표 수정 시 재분석 훅 연결 (제목/내용 변경 시)
- [x] 자동 그룹핑 로직 (코사인 유사도 > 0.75 클러스터링)
- [x] GPT 기반 그룹 이름/아이콘 자동 생성
- [x] 그룹 API (조회 + 재계산)
- [x] 분석 요약 API (영역, 가치관, 감정 통계)
- [x] 대시보드 그룹 필터 태그 UI
- [x] 목표 카드에 그룹 태그 배지 표시
- [x] 기존 데이터 일괄 분석 백필 스크립트

**관련 파일:**
| 파일 | 역할 |
|------|------|
| `src/lib/openai/embeddings.ts` | 임베딩 생성, 저장, 유사도 검색 |
| `src/lib/openai/interest-extraction.ts` | 관심사/감정/가치관 추출 + DB 연동 |
| `src/lib/openai/grouping.ts` | 클러스터링 + 그룹 네이밍 |
| `src/app/api/groups/route.ts` | 그룹 조회/재계산 API |
| `src/app/api/analysis/route.ts` | 분석 요약 API |
| `scripts/backfill-analysis.ts` | 기존 목표 일괄 분석 |
| `tasks/migration-phase1-interests.sql` | Phase 1 DB 마이그레이션 |

**신규 DB 테이블:**
| 테이블 | 용도 |
|--------|------|
| `interests` | 글로벌 관심사 사전 (벡터 임베딩 포함) |
| `user_interests` | 유저-관심사 연결 |
| `interest_edges` | 관심사 간 공동 출현 관계 |
| `aspiration_embeddings` | 목표 벡터 임베딩 (1536차원) |
| `aspiration_groups` | 자동 생성 그룹 |
| `aspiration_group_members` | 그룹 멤버십 |
| `aspiration_analysis` | 분석 결과 캐시 |
| `recommendations` | 추천 로그 |

**비용:** 목표 1건당 ~$0.003 (임베딩 + 추출)

---

## 앞으로 진행할 작업

### Phase 2: 인텔리전스 (5-10주 예상)

> 유저의 관심사를 시각적으로 보여주고, 성격 기반 맞춤 경험을 제공

- [ ] 관심사 그래프 빌딩 + 시각화 페이지 (`/interests`)
  - 관심사 노드 + 엣지를 인터랙티브 그래프로 표현
  - 노드 크기 = 관심 강도, 엣지 두께 = 공동 출현 횟수
- [ ] 유저 프로필 구축 + "내 프로필" 페이지 (`/profile`)
  - Big Five 성격 신호 (개방성, 성실성, 외향성, 친화성, 신경성)
  - 성장 지향성 (achiever/explorer/maintainer)
  - 핵심 가치관 + 감정 패턴 + 생활 영역 분포
  - EMA(지수 이동 평균) 기반 최신 데이터 가중치
- [ ] 설정에 성격 분석 opt-in 토글 추가
  - `user_settings.personality_analysis_enabled` 연동
- [ ] 햄댕치 성격 맞춤 톤 조절
  - `src/lib/openai/alerts.ts` 프롬프트에 유저 프로필 반영
  - 예: 성실성 높은 유저에게는 구체적 액션 위주, 개방성 높은 유저에게는 탐험 위주
- [ ] 추천 엔진 v1 + 대시보드 "Discover" 위젯
  - 3계층: 유사 관심사 확장(50%) + 교차 유저 패턴(30%) + 성격 기반 발견(20%)
  - 개방성 점수에 따라 비율 자동 조정
  - 추천 카드: [목표로 만들기] [관심없음] [더 알아보기]

**예상 신규 파일:**
| 파일 | 역할 |
|------|------|
| `src/app/interests/page.tsx` | 관심사 그래프 시각화 페이지 |
| `src/app/profile/page.tsx` | 유저 프로필/성격 분석 페이지 |
| `src/lib/openai/profile.ts` | Big Five 분석 + 프로필 빌딩 |
| `src/lib/openai/recommendations.ts` | 3계층 추천 엔진 |
| `src/app/api/profile/route.ts` | 프로필 API |
| `src/app/api/recommendations/route.ts` | 추천 API |
| `src/components/dashboard/DiscoverWidget.tsx` | 추천 카드 위젯 |
| `src/components/interests/InterestGraph.tsx` | 그래프 시각화 컴포넌트 |

**DB 변경:**
- `user_profiles` 테이블 활용 (Phase 1 마이그레이션에 포함 예정)

---

### Phase 3: 성장 (11-18주 예상)

> 유저의 성장 패턴을 추적하고 동기를 강화

- [ ] 주간 인사이트 자동 생성
  - 관심사 트렌드 변화 (새로 뜬 관심사, 줄어든 관심사)
  - 감정 패턴 리포트 (이번 주 감정 분포)
  - 목표 진행 요약 (완료, 추가, 기한 임박)
  - 새로운 관심사 추천 1-2개 포함
- [ ] 관심사 그래프 인터랙티브 시각화 고도화
  - 줌, 드래그, 노드 클릭 상세보기
  - 시계열 필터 (기간별 그래프 변화)
- [ ] 수익화 모델 선택 및 구현
  - 프리미엄 구독 (월 4,900원): 무제한 인사이트, 성격 리포트, 전체 그래프
  - 관심사 기반 제휴 (동의 하 서비스 연결)
  - B2B API (익명화된 상관관계 데이터)
- [ ] 업적 뱃지 시스템
  - 탐험가: 5개 이상 다른 영역의 목표
  - 딥다이버: 한 영역에 10개 이상 목표
  - 달성왕: 연속 5개 목표 완료
  - 초기 기록자: 첫 목표 등록

**예상 신규 파일:**
| 파일 | 역할 |
|------|------|
| `src/app/api/insights/route.ts` | 주간 인사이트 생성/조회 |
| `src/app/api/cron/weekly-insights/route.ts` | Cron: 주간 인사이트 자동 생성 |
| `src/app/insights/page.tsx` | 인사이트 리포트 페이지 |
| `src/lib/openai/insights.ts` | 인사이트 분석 로직 |
| `src/components/badges/BadgeCard.tsx` | 뱃지 표시 컴포넌트 |

---

### Phase 4: 스케일 (19-26주 예상)

> 데이터 해자 구축 + 인수 준비

- [ ] 익명화된 소셜 기능
  - "나와 비슷한 사람들" 통계 (관심사 분포 비교)
  - "이 관심사를 가진 사람의 68%가 X도 좋아합니다" 인사이트
  - 유저 간 직접 소통 없이 데이터 기반 연결만
- [ ] B2B API
  - 익명화된 관심사 상관관계 데이터
  - API 키 발급 + 사용량 추적
  - 문서화 (Swagger/OpenAPI)
- [ ] PIPA 컴플라이언스 (한국 개인정보보호법)
  - 개인정보 수집/이용 동의
  - 데이터 삭제 요청 처리
  - 익명화 파이프라인 검증
  - 개인정보 처리방침 페이지
- [ ] 메트릭스 대시보드 + 인수 준비 자료
  - 등록 유저 / MAU / 리텐션 / 평균 목표 수
  - 관심사 노드 수 / 교차 유저 상관관계 수
  - 성장 그래프 + 핵심 지표 시각화

**인수 트리거 목표:**
| 지표 | 목표값 |
|------|--------|
| 등록 유저 | 10만+ |
| MAU | 3만+ |
| 30일 리텐션 | 30%+ |
| 유저당 평균 목표 수 | 10+ |
| 관심사 노드 수 | 5,000+ |
| 교차 유저 상관관계 | 50,000+ |

---

## 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16, React 19, TypeScript |
| 스타일링 | Tailwind CSS 4 |
| DB | Supabase (PostgreSQL + pgvector) |
| 인증 | Supabase Auth (이메일+비밀번호) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| 알림 | Discord Webhook + Vercel Cron |
| 배포 | Vercel |
| PWA | next-pwa |

---

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
OPENAI_API_KEY=<openai-api-key>
CRON_SECRET=<random-secret-for-cron-auth>
FEEDBACK_DISCORD_WEBHOOK_URL=<optional-discord-webhook>
```

---

## 배포 체크리스트

### Phase 1 배포 (현재)
1. Supabase SQL Editor에서 `tasks/migration-phase1-interests.sql` 실행
2. 코드 푸시 -> Vercel 자동 배포
3. 기존 데이터 백필: `npx tsx --env-file=.env.local scripts/backfill-analysis.ts`
4. 검증: 새 목표 생성 후 분석 태그 표시 확인
