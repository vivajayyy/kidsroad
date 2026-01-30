# Kidsroad (키즈로드)

> 아이와 함께하는 모든 순간, 키즈로드가 안내합니다

부모를 위한 아이 동반 축제/행사 큐레이션 서비스입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)

## Demo

**Live**: [https://kidsroad.vercel.app](https://kidsroad.vercel.app)

## Project Overview

### Problem

- 부모들이 아이와 갈만한 행사를 찾기 위해 네이버, 블로그, 맘카페 등 **여러 소스를 30분 이상 검색**
- 행사 정보는 있지만, **주차/유모차/수유실** 같은 부모에게 중요한 정보는 파편화되어 있음
- 연령대별 적합성 판단이 어려움

### Solution

- **공공 API 데이터 자동 수집** (TourAPI)
- **AI 기반 블로그 분석**으로 시설 정보 보강
- **부모 체크리스트 필터** (주차, 유모차, 수유실, 실내/실외, 무료/유료)
- **연령대별 필터링** (0-2세, 3-5세, 6-9세, 10세+)

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Server Components)
- **React 19** (use, Server Actions)
- **TypeScript 5** (Strict Mode)
- **Tailwind CSS v4**

### Backend & Database
- **Supabase** (PostgreSQL + Auth + RLS)
- **Next.js API Routes** (Serverless Functions)
- **Vercel Cron** (자동 데이터 수집 스케줄링)

### External APIs
- **TourAPI** (한국관광공사) - 축제/행사 데이터
- **Naver Blog Search API** - 블로그 검색
- **Anthropic Claude API** - 블로그 분석 AI

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 16 App Router + React 19 Server Components         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  /api/cron/collect-events   - 데이터 수집 파이프라인         │
│  /api/auth/*               - Supabase Auth                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   TourAPI    │    │  Naver Blog  │    │   Claude AI  │
│  축제/행사   │    │   Search     │    │  블로그 분석 │
└──────────────┘    └──────────────┘    └──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  PostgreSQL + Row Level Security + OAuth (Kakao)            │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Data Pipeline (자동화된 데이터 수집)

```typescript
// lib/data-pipeline.ts
export async function collectEvents() {
  // 1. TourAPI에서 축제/행사 검색
  const festivals = await searchFestival2({ eventStartDate: today });

  // 2. 상세 정보 조회 (overview, 좌표, 연락처 등)
  const details = await Promise.all(
    festivals.map(f => detailCommon2(f.contentid))
  );

  // 3. Supabase에 저장
  await upsertEvents(mappedEvents);
}
```

### 2. AI-Powered Data Enrichment

블로그 크롤링 + Claude AI 분석으로 시설 정보 자동 보강:

```typescript
// lib/ai-analyzer.ts
const prompt = `
이 블로그 후기들을 분석해서 다음 정보를 추출해주세요:
- has_parking: 주차 가능 여부
- has_stroller_access: 유모차 이용 가능 여부
- has_nursing_room: 수유실 유무
- is_kid_friendly: 아이 동반 적합성
`;

const result = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  messages: [{ role: 'user', content: prompt + blogContents }]
});
```

### 3. Client-Side Filtering (최적화된 필터링)

서버 재요청 없이 즉시 필터링:

```typescript
// components/EventView.tsx
const filteredEvents = useMemo(() => {
  return events.filter((event) => {
    if (filters.checklist.free && !event.is_free) return false;
    if (filters.checklist.parking && !event.has_parking) return false;
    if (filters.checklist.stroller && !event.has_stroller_access) return false;
    // ... more filters
    return true;
  });
}, [events, filters]);
```

### 4. Kakao OAuth Integration

```typescript
// Supabase Auth with Kakao Provider
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'kakao',
  options: { redirectTo: `${origin}/auth/callback` }
});
```

## AI Utilization (AI 활용)

이 프로젝트는 **AI-Assisted Development**의 실험적 사례입니다.

### Development Process

| 단계 | AI 활용 |
|------|---------|
| **기획** | PRD 작성, 기능 정의, 로드맵 설계 |
| **설계** | DB 스키마 설계, API 구조 설계 |
| **구현** | 코드 작성, 디버깅, 리팩토링 |
| **리뷰** | 코드 리뷰, 보안 검토, 성능 최적화 |

### AI Tools Used

- **Claude Code (Anthropic)**: 메인 개발 도구
  - 전체 코드베이스 이해 및 수정
  - 실시간 디버깅 및 문제 해결
  - 아키텍처 설계 및 리팩토링

- **Claude Haiku API**: 런타임 AI 분석
  - 블로그 콘텐츠 분석
  - 시설 정보 추출
  - JSON 구조화 응답 생성

### Learnings

**AI 활용이 효과적이었던 영역:**
- 보일러플레이트 코드 생성
- API 연동 및 타입 정의
- 반복적인 CRUD 구현
- 문서화 및 주석 작성

**사람의 판단이 필요했던 영역:**
- 비즈니스 모델 검증
- 데이터 품질 문제 (TourAPI 한계)
- UX 의사결정
- 프로젝트 방향성 (계속 vs 중단)

## Project Structure

```
kidsroad/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 메인 페이지
│   ├── events/[id]/          # 상세 페이지
│   ├── bookmarks/            # 북마크 페이지
│   ├── api/                  # API Routes
│   │   ├── cron/             # 스케줄링 작업
│   │   └── auth/             # 인증 관련
│   └── auth/                 # Auth 콜백
├── components/
│   ├── EventCard.tsx         # 이벤트 카드
│   ├── EventView.tsx         # 이벤트 목록 + 필터
│   ├── filter/               # 필터 컴포넌트
│   └── ui/                   # 공통 UI 컴포넌트
├── lib/
│   ├── tour-api.ts           # TourAPI 클라이언트
│   ├── blog-crawler.ts       # 블로그 크롤러
│   ├── ai-analyzer.ts        # Claude AI 분석
│   ├── data-enrichment.ts    # 데이터 보강 오케스트레이터
│   └── data-pipeline.ts      # 전체 파이프라인
├── types/
│   ├── supabase.ts           # DB 타입 (자동 생성)
│   └── tour-api.ts           # TourAPI 응답 타입
├── utils/
│   └── mapper.ts             # 데이터 매핑 유틸
└── docs/                     # 프로젝트 문서
    ├── PRD.md                # 제품 요구사항
    └── ROADMAP.md            # 개발 로드맵
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API Keys (TourAPI, Naver, Anthropic)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TourAPI (한국관광공사)
NEXT_PUBLIC_TOUR_API_KEY=

# Naver Blog Search
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Claude AI
ANTHROPIC_API_KEY=
```

## Database Schema

```sql
-- events 테이블
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contentid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  addr1 TEXT,
  mapx DECIMAL,
  mapy DECIMAL,
  eventstartdate DATE,
  eventenddate DATE,
  firstimage TEXT,
  description TEXT,

  -- Kidsroad 전용 필드
  age_ranges TEXT[],
  is_free BOOLEAN,
  is_indoor BOOLEAN,
  is_outdoor BOOLEAN,
  has_parking BOOLEAN,
  has_stroller_access BOOLEAN,
  has_nursing_room BOOLEAN,
  has_diaper_station BOOLEAN,
  category TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bookmarks 테이블
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Setup on Vercel

1. Vercel Dashboard > Project Settings > Environment Variables
2. Add all variables from `.env.example`
3. Redeploy

## Retrospective (회고)

### What Went Well
- TourAPI 연동 및 데이터 파이프라인 구축
- Next.js 16 + React 19 최신 스택 적용
- Supabase Auth + RLS 보안 구현
- AI 기반 데이터 보강 파이프라인 설계

### Challenges
- **데이터 품질 한계**: TourAPI는 축제/행사에 대해 시설정보를 제공하지 않음
- **블로그 AI 분석 한계**: 관련 블로그 찾기 어려움, JSON 파싱 실패 다수
- **차별화 어려움**: 네이버 검색, 맘카페 대비 명확한 가치 제안 부족

### Key Decision: Project Closure
- 핵심 기능인 "부모 체크리스트"의 데이터 자동 수집이 현실적으로 어려움
- 수동 데이터 입력은 확장성 부족
- 기존 서비스 대비 차별점 부재
- **결론**: 포트폴리오로 보존, 추가 개발 중단

## License

MIT License

---

*Built with Claude Code - AI-assisted development experiment*
