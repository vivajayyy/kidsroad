# Kidsroad Development Standards (AI Agent Version)

**⚠️ CRITICAL: FOR AI AGENT OPERATIONAL USE ONLY. DO NOT INCLUDE GENERAL DEVELOPMENT KNOWLEDGE.**

## 1. 언어 및 문서화 규칙 (Language & Documentation)
- **모든 태스크 관리(Task Management)**: 태스크 이름, 설명, 구현 가이드, 검증 기준은 반드시 **한국어**로 작성한다.
- **문서화**: `docs/` 내의 모든 문서 업데이트(`WORKLOG.md`, `TODO.md` 등)는 **한국어를 기본 언어**로 사용한다.
- **코드 주석**: 복잡한 로직에 대한 설명은 한국어 주석을 사용하되, 코드 자체는 영문 명명 규칙을 따른다.

## 2. 프로젝트 개요 (Project Overview)
- **핵심 목표**: 한국 내 아이들을 위한 축제 및 행사 정보 큐레이션 플랫폼.
- **기술 스택**:
  - **Core**: Next.js 16 (App Router), React 19, Supabase (Auth/DB), Tailwind CSS v4.
  - **Data/AI**: Naver Map API v3, Claude 3 Haiku (AI 분석), Cheerio (크롤링).
- **데이터 소스**: TourAPI (KTO) + 네이버 블로그 검색 및 AI 데이터 보강.

## 3. 프로젝트 아키텍처 및 디렉토리 규칙
- `app/`: 라우트 및 API 엔드포인트. App Router 컨벤션 준수.
- `components/`: UI 컴포넌트.
- `lib/`: 핵심 비즈니스 로직 및 서비스.
  - `data-collection.ts`: 데이터 수집/파이프라인 오케스트레이션.
  - `ai-analyzer.ts`: Claude API를 이용한 데이터 정제.
  - `blog-crawler.ts`: 추가 정보 수집을 위한 크롤러.
- `supabase/`: 데이터베이스 마이그레이션 (`/migrations`) 및 설정.
- `types/`: 모든 DB 상호작용에 `types/supabase.ts`(자동 생성) 사용.
- `utils/`: 데이터 변환 로직 (예: `mapper.ts`).
- `docs/`: 프로젝트 컨텍스트. 작업 완료 후 `WORKLOG.md`와 `TODO.md` 필수 업데이트.

## 4. 코드 및 UI 표준
- **명명 규칙**: 변수/함수 `camelCase`, 컴포넌트 `PascalCase`, 파일명 `kebab-case` (컴포넌트 제외).
- **아이콘**: `material-symbols-outlined` 전용 사용.
- **스타일링**: Tailwind CSS v4 사용. "Minimalist Premium" 미학 유지 (sage, primary, dark-gray).
- **인증 (Auth)**:
  - 클라이언트 사이드: `@/lib/auth/client`의 `createClient` 사용.
  - 서버 사이드: `@/lib/auth/server`의 `createClient` 사용.
- **데이터베이스**:
  - 항상 타입이 지정된 쿼리 사용: `supabase.from('events').select<Event>('*')`.
  - 구현 전 `supabase/migrations`의 RLS 정책 확인.
  - 사용자별 데이터: `profiles`(정보), `bookmarks`(찜하기) 테이블 활용.

## 5. 구현 규칙
- **데이터 파이프라인**: 모든 데이터 수집은 `TourAPI 수집` -> `기본 매핑(mapper.ts)` -> `블로그 검색/크롤링` -> `AI 분석(ai-analyzer.ts)` -> `저장` 순서를 따른다.
- **지도 연동**: Naver Map API 사용. 좌표는 `mapx`(경도), `mapy`(위도)에 `DECIMAL`로 저장.
- **낙관적 업데이트 (Optimistic Updates)**: 북마크, 좋아요 등 사용자 상호작용은 즉각적인 UI 피드백을 제공해야 한다.
- **에러 처리**: `lib/` 서비스에서는 `try/catch` 사용, UI에서는 사용자 친화적 메시지 제공.
- **성능**: 모든 이미지에 `next/image` 사용. 지도와 같은 무거운 컴포넌트는 Lazy loading 적용.

## 6. 다중 파일 협업 (필수 업데이트)
- 태스크 완료 시:
  1. `docs/WORKLOG.md`에 구체적인 변경 사항 기록.
  2. `docs/TODO.md` 항목을 완료로 표시.
  3. DB 스키마 변경 시 `types/supabase.ts` 업데이트 확인.

## 7. 금지 사항
- **금지**: 사용자 세션 관리에 로컬 상태 사용 금지 (항상 Supabase Auth 사용).
- **금지**: API 키나 비밀 정보를 하드코딩 금지 (`.env` 사용).
- **금지**: `supabase/migrations`에 대응하는 `.sql` 마이그레이션 없이 테이블 생성 금지.
- **금지**: 외부 API 연동 시 `utils/mapper.ts` 우회 금지.