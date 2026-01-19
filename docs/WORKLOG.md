# 🛠️ 개발 작업 일지 (Work Log)

> 날짜별 주요 개발 사항, 버그 수정, 이슈 해결 내역을 기록합니다.
> 최신 내역이 상단에 위치합니다.

---

## 2026-01-19 (월)

### 👤 마이페이지 및 북마크 UI 구현

- **분류**: `Feature` / `UI`
- **작업 내용**:
  - **마이페이지 라우트 생성**: `/my` 경로에 사용자 프로필 및 북마크 목록 페이지 구현
  - **데이터 연동**:
    - Supabase `profiles` 테이블에서 사용자 정보 조회
    - `bookmarks` 테이블과 `events` 테이블을 연동하여 찜한 행사 목록 조회
  - **UI 구현**:
    - 사용자 프로필 섹션 (아바타/닉네임)
    - 북마크 목록 그리드 뷰 (`EventCard` 재사용)
    - 빈 상태(Empty State) 디자인 적용 (북마크 없을 시 탐색 유도)
  - **보안**: 서버 사이드 세션 확인 및 미로그인 시 리다이렉트 처리
- **관련 파일**:
  - `app/my/page.tsx`, `app/my/layout.tsx`
  - `components/EventCard.tsx`

### 🗺️ 네이버 지도 컴포넌트 구현

- **분류**: `Feature` / `Map`
- **작업 내용**:
  - **지도 스크립트 로드**: `next/script`를 사용하여 Naver Maps API v3 비동기 로드 구현 (`app/layout.tsx`)
  - **NaverMap 컴포넌트 개발**:
    - `components/NaverMap.tsx` 생성
    - 이벤트 좌표(`mapx`, `mapy`) 기반 마커 렌더링
    - 마커 클릭 시 InfoWindow(제목, 주소) 표시
    - `LatLngBounds`를 이용한 자동 줌/중심 조정 기능 추가
  - **환경 변수 설정**: `.env.example`에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가
- **관련 파일**:
  - `components/NaverMap.tsx`
  - `app/layout.tsx`

### 🔄 리스트/지도 뷰 통합

- **분류**: `Feature` / `UI`
- **작업 내용**:
  - **뷰 모드 토글**: `EventView` 컴포넌트에 리스트/지도 전환 기능 추가
  - **지도 연동**: `NaverMap` 컴포넌트를 통합하여 지도 뷰에서 이벤트 위치 시각화
  - **인터랙션 통합**: 지도 마커 클릭 시 사이드 패널(`DetailPanel`)이 열리도록 연결 (`onEventSelect`)
  - **UX 개선**: 뷰 전환 시 상태 유지 및 부드러운 전환 처리
- **관련 파일**:
  - `components/EventView.tsx`
  - `components/NaverMap.tsx`

### 💅 UX 개선 및 반응형 최적화

- **분류**: `Feature` / `UX`
- **작업 내용**:
  - **마이페이지 로딩 UI**: `app/my/loading.tsx` 추가로 프로필/북마크 스켈레톤 구현
  - **모바일 반응형 개선**: `DetailPanel`이 모바일에서 정상적으로 오버레이되도록 CSS 수정 (hidden 제거 및 translate 적용)
  - **북마크 인터랙션 강화**: `EventCard` 내에서 북마크 토글 기능 직접 지원 및 낙관적 업데이트 적용
- **관련 파일**:
  - `app/my/loading.tsx`
  - `components/EventView.tsx`
  - `components/EventCard.tsx`

### 🌍 지도 필터링 및 알림 UX 개선

- **분류**: `Feature` / `UX`
- **작업 내용**:
  - **지도 영역 필터링**: `NaverMap`의 Bounds 변경 감지 및 '이 지역에서 검색' 버튼 구현
  - **Toast 알림 시스템**: `ToastProvider` 및 `useToast` 훅 구현, 북마크 작업 시 피드백 제공
  - **UX 디테일**: 지도 이동 시 검색 버튼 오버레이, 북마크 성공/취소/에러 상황별 메시지 처리
- **관련 파일**:
  - `components/NaverMap.tsx`
  - `components/EventView.tsx`
  - `components/ui/Toast.tsx`
  - `app/layout.tsx`

---

## 2026-01-13 (월)

### 🎉 Week 5 완료: 검색/필터 + Kakao 로그인

- **분류**: `Feature` / `Auth` / `Database`
- **작업 내용**:
  - **검색 및 필터 UI 구현**:
    - FilterBar 컴포넌트 생성 (검색어, 카테고리, 지역)
    - 300ms debounce로 성능 최적화
    - URL 쿼리 파라미터로 상태 관리
  - **Supabase 쿼리 연동**:
    - 검색어 필터링 (`ilike`)
    - 카테고리 필터링 (`eq`)
    - 지역 필터링 (`like`)
  - **Kakao 소셜 로그인 구현**:
    - @supabase/ssr 패키지 추가
    - 서버/클라이언트 Auth 헬퍼 생성
    - AuthButton 컴포넌트 (카카오 공식 스타일)
    - OAuth callback 라우트 구현
    - Header에 로그인/로그아웃 UI 통합
  - **데이터베이스 확장**:
    - profiles 테이블 생성 (닉네임, 프로필 이미지)
    - bookmarks 테이블 생성 (사용자별 북마크)
    - 자동 프로필 생성 트리거 추가
    - RLS 정책 적용 (보안)
  - **버그 수정**:
    - 이미지 로딩 에러 해결 (HTTP 프로토콜 추가)
    - Null 데이터 처리 개선 (이미지/날짜/설명)
    - Next.js Image 설정 마이그레이션 (remotePatterns)
- **관련 파일**:
  - `components/FilterBar.tsx`, `components/AuthButton.tsx`
  - `lib/auth/server.ts`, `lib/auth/client.ts`
  - `app/auth/callback/route.ts`
  - `supabase/migrations/20260113_create_profiles_and_bookmarks.sql`
  - `docs/KAKAO_LOGIN_SETUP_GUIDE.md`
  - `docs/archive/Week5_Completed.md`

---

## 2026-01-06 (화)

### 📝 TourAPI 인증키 발급 및 문서 최신화

- **분류**: `Docs` / `Setup`
- **작업 내용**:
  - **TourAPI 발급처 정보 수정**:
    - TourAPI 인증키 발급처가 `api.visitkorea.or.kr`이 아닌 공공데이터포털(`data.go.kr`)임을 확인 및 반영
    - PRD, TODO, ROADMAP 문서 내 잘못된 URL 및 절차 정보 수정
  - **TourAPI 활용 가이드 작성**:
    - `docs/api` 내 매뉴얼 분석을 통해 핵심 API 규격 및 매핑 전략 정리 (`docs/TOUR_API_GUIDE.md`)
    - Kidsroad 특화 부모 체크리스트 데이터 변환 로직 초안 수립
  - **인증키 발급 완료**:
    - 공공데이터포털을 통한 "한국관광공사\_국문 관광정보 서비스\_GW" 활용 신청 및 승인 완료
  - **TourAPI 환경변수 및 타입 정의**:
    - `.env.local`에 `NEXT_PUBLIC_TOUR_API_KEY` 등록 완료
    - TourAPI 응답 구조에 맞춘 TypeScript 인터페이스 정의 (`types/tour-api.ts`)
  - **문서 현행화**:
    - 전체 로드맵 및 진행 상황을 Week 2로 업데이트
- **관련 파일**:
  - `docs/PRD.md`
  - `docs/TODO.md`
  - `docs/ROADMAP.md`
  - `docs/WORKLOG.md`

---

## 2026-01-05 (월)

### 🗄️ Supabase Events 테이블 설계 및 생성 완료

- **분류**: `Database` / `Setup`
- **작업 내용**:
  - **Supabase CLI 설정**:
    - Homebrew로 Supabase CLI 설치 (v2.67.1)
    - 프로젝트 연결 완료 (`supabase link --project-ref pajxzcnddwnknhbddbws`)
    - 로컬 프로젝트 초기화 (`supabase init`)
  - **Events 테이블 스키마 설계**:
    - 34개 필드: TourAPI 매핑(20) + Kidsroad 특화(9) + 시스템(5)
    - 연령 필터: `age_ranges TEXT[]` - 복수 선택 지원
    - 부모 체크리스트: 개별 BOOLEAN 컬럼 (is_indoor, has_parking 등)
    - 위치 정보: DECIMAL + earthdistance extension
  - **성능 최적화**:
    - 7개 전략적 인덱스 생성 (날짜, 위치, 연령, 태그, 전문검색, 카테고리, 체크리스트)
    - GIN 인덱스로 배열 검색 최적화
    - Partial 인덱스로 크기 최소화
  - **보안 설정**:
    - RLS(Row Level Security) 정책 활성화
    - anon/authenticated: SELECT만 허용
    - service_role: 모든 작업 허용
  - **마이그레이션 및 배포**:
    - `supabase/migrations/20260105_create_events_table.sql` 생성
    - 원격 DB에 테이블 푸시 완료 (`supabase db push`)
    - TypeScript 타입 자동 생성 (`types/supabase.ts`)
  - **테스트 완료**:
    - 샘플 데이터 삽입/조회 성공
    - 연령 필터 (`age_ranges`) 동작 확인
    - 체크리스트 필터 (is_free, has_parking) 동작 확인
- **관련 파일**:
  - `supabase/migrations/20260105_create_events_table.sql`
  - `types/supabase.ts`
  - `scripts/test-db.ts`, `scripts/check-db.ts`
  - `docs/DATABASE.md` (신규 생성)
  - `.env.local` (환경변수 설정)

---

## 2026-01-05 (월)

### 📋 문서 정리 및 작업 범위 명확화

- **분류**: `Docs`
- **작업 내용**:
  - **TODO.md 수정**: Week 2 작업에서 `profiles`, `bookmarks` 테이블 제거
    - 현재 주차는 `events` 테이블만 집중
    - 불필요한 테이블 생성으로 인한 혼란 방지
  - **ROADMAP.md 업데이트**: Week 5에 사용자 기능 관련 테이블 추가
    - `profiles` 테이블 생성 (사용자 정보)
    - `bookmarks` 테이블 생성 (찜하기 기능)
    - Kakao 로그인 구현 계획 명시
  - **작업 우선순위 재정립**: MVP 접근법으로 현재 필요한 것만 구현
- **관련 파일**:
  - `docs/TODO.md`
  - `docs/ROADMAP.md`

---

## 2026-01-05 (월)

### 🛠️ 프로젝트 최신화 및 관리

- **분류**: `Chore` / `Docs`
- **작업 내용**:
  - Git 저장소 최신화 (Sync) 및 커밋 히스토리 정리 (Squash)
  - `.agent` 디렉토리 및 프로젝트 규칙 통합 (`.agent/rules/kidsroad.md`)
  - **개발 환경 파편화 해결**:
    - `.env.example` 템플릿 생성 및 `.gitignore` 예외 처리
    - 패키지 설치 (`npm install`) 및 Prettier 포맷팅 적용
  - **배포 환경 준비**:
    - Vercel 연동을 위한 문서(`TODO`, `ROADMAP`) 업데이트
    - **Vercel 배포 완료**: `https://kidsroad.vercel.app/` 연결 성공
  - 커밋 메시지 규칙(한글 필수) 및 단위(Atomic) 가이드라인 수립
  - **주차 전환 (W1 -> W2)**:
    - 1주차 할 일 아카이빙 (`docs/archive/Week1_Foundation.md`)
    - 2주차 목표 수립 (DB 설계 및 API 연동)
- **관련 파일**:
  - `docs/WORKLOG.md`, `docs/TODO.md`, `docs/ROADMAP.md`
  - `.agent/rules/kidsroad.md`
  - `.env.example`, `.gitignore`

## 2026-01-04 (일)

### 🎨 UI 프레임워크 기초 작업 및 첫 화면 구성

- **분류**: `Frontend` / `UI/UX`
- **작업 내용**:
  - 모바일 퍼스트 레이아웃 구현 (`max-w-md`, 중앙 정렬 컨테이너)
  - 프로젝트 메타데이터(Title, Description) 최적화 (PRD 반영)
  - `lucide-react` 아이콘 라이브러리 설치 및 적용
  - 시각적 완성도를 위한 공통 헤더 컴포넌트 추가
  - `app/page.tsx` 초기 디자인 적용 (환영 인사 및 카드 레이아웃)
- **관련 파일**:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `package.json`
  - `docs/TODO.md`

## 2026-01-03 (토)

### 🔗 Supabase 연동 및 타입 생성

- **분류**: `Setup` / `Backend`
- **작업 내용**:
  - Supabase 프로젝트 연결 및 환경 변수(`.env.local`) 설정
  - Supabase Client 유틸리티 구현 (`lib/supabase.ts`)
  - Supabase CLI를 이용한 TypeScript 타입 생성 (`types/supabase.ts`)
  - `Database` Generic 타입을 클라이언트에 적용하여 타입 안정성 확보
- **관련 파일**:
  - `.env.local`
  - `lib/supabase.ts`
  - `types/supabase.ts`
  - `docs/TODO.md`
  - `docs/ROADMAP.md`

### 🔧 코드 품질 도구 설정

- **분류**: `Setup` / `Code Quality`
- **작업 내용**:
  - Prettier 설정 추가
    - `.prettierrc`: 코드 포맷팅 규칙 설정
    - `.prettierignore`: 포맷팅 제외 파일 목록
    - `package.json`에 `format`, `format:check` 스크립트 추가
  - ESLint 설정 업데이트
    - `eslint.config.mjs`: Prettier 통합 설정 추가
    - `eslint-config-prettier`, `eslint-plugin-prettier` 의존성 추가
  - `CLAUDE.md` 파일 추가: Claude Code를 위한 프로젝트 가이드 문서
  - `docs/TODO.md` 업데이트
- **관련 파일**:
  - `.prettierrc`
  - `.prettierignore`
  - `eslint.config.mjs`
  - `package.json`
  - `package-lock.json`
  - `CLAUDE.md`
  - `docs/TODO.md`

## 2026-01-02 (금)

### 📝 프로젝트 초기화 및 문서 작성

- **분류**: `Setup` / `Docs`
- **작업 내용**:
  - Next.js 16 + React 19 + Tailwind CSS v4 환경 구성 확인
  - `docs/` 디렉토리 생성 및 기획 문서 세트 작성
    - `PRD.md`: 요구사항 정의
    - `git_branch_guide.md`: 브랜치 전략 가이드
    - `project_checklist.md`: 1인 개발 체크리스트
    - `ROADMAP.md`: 전체 일정 관리 마일스톤
    - `TODO.md`: 주간 할 일 관리
  - Git 저장소 초기화 및 `dev` 브랜치 생성, 원격 저장소 연동
- **관련 파일**:
  - `docs/*`
  - `package.json`
