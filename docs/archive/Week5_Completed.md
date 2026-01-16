# Week 5 완료 보고서

> **기간**: 5주차 (검색 및 필터 기능)
> **목표**: 사용자가 원하는 정보를 쉽게 찾을 수 있도록 핵심 검색 및 필터 기능을 구현합니다.
> **상태**: 완료 ✅

---

## 완료된 작업

### 1. 검색 및 필터 UI 구현 ✅

- ✅ 메인 페이지에 검색 입력 필드 추가
  - 300ms debounce 적용으로 성능 최적화
  - 실시간 URL 파라미터 업데이트
- ✅ 카테고리 필터 UI 구현
  - 전체/축제·행사/문화시설/관광지/레포츠
  - 드롭다운 형태로 깔끔한 UX 제공
- ✅ 지역 필터 UI 구현
  - 전국 17개 시도 선택 가능
  - URL 쿼리 파라미터로 상태 관리

**관련 파일**:
- `components/FilterBar.tsx`

### 2. Supabase 쿼리 연동 ✅

- ✅ 검색어 필터링 로직
  - `ilike` 쿼리로 대소문자 무관 검색
  - 이벤트 제목 기준 검색
- ✅ 카테고리 필터링 로직
  - `eq` 쿼리로 정확한 매칭
  - category 컬럼 기준 필터링
- ✅ 지역 필터링 로직
  - `like` 쿼리로 주소 매칭
  - addr1 컬럼에서 지역명 검색

**관련 파일**:
- `app/page.tsx` (Server Component)

### 3. 사용자 인증 기능 (Kakao 로그인) ✅

- ✅ Kakao 개발자 등록 및 API 키 발급
  - REST API 키: `4a0c0383e4c80a9a5ad70312519df3d3`
  - Redirect URI 등록 완료
- ✅ Supabase Auth에 Kakao OAuth 연동 설정
  - Kakao Provider 활성화
  - Client ID 등록
- ✅ Next.js 앱에 Kakao 로그인 UI 및 인증 흐름 구현
  - `@supabase/ssr` 패키지 추가
  - 서버/클라이언트 Auth 헬퍼 생성
  - OAuth callback 라우트 구현
  - 카카오 공식 스타일의 로그인 버튼

**관련 파일**:
- `lib/auth/server.ts` - 서버 컴포넌트용 Supabase 클라이언트
- `lib/auth/client.ts` - 클라이언트 컴포넌트용 Supabase 클라이언트
- `components/AuthButton.tsx` - 로그인/로그아웃 버튼
- `app/auth/callback/route.ts` - OAuth 콜백 핸들러
- `app/layout.tsx` - 사용자 세션 관리
- `components/Header.tsx` - 인증 UI 통합
- `docs/KAKAO_LOGIN_SETUP_GUIDE.md` - 설정 가이드

### 4. `profiles` 테이블 생성 및 연동 ✅

- ✅ `profiles` 테이블 스키마 설계
  - `id`: UUID (auth.users FK)
  - `nickname`: TEXT
  - `avatar_url`: TEXT
  - `created_at`, `updated_at`: TIMESTAMP
- ✅ Supabase에서 `profiles` 테이블 생성
  - RLS 정책 적용
  - 모든 사용자가 프로필 조회 가능
  - 본인만 프로필 수정 가능
- ✅ 사용자 가입 시 `profiles` 테이블에 기본 정보 저장 로직 구현
  - `handle_new_user()` 트리거 함수 생성
  - Kakao에서 받은 닉네임/프로필 이미지 자동 저장

**관련 파일**:
- `supabase/migrations/20260113_create_profiles_and_bookmarks.sql`

### 5. `bookmarks` 테이블 생성 ✅

- ✅ `bookmarks` 테이블 스키마 설계
  - `id`: UUID (자동 생성)
  - `user_id`: UUID (auth.users FK)
  - `event_id`: TEXT
  - `created_at`: TIMESTAMP
  - UNIQUE 제약: (user_id, event_id) - 중복 북마크 방지
- ✅ Supabase에서 `bookmarks` 테이블 생성
  - RLS 정책 적용
  - 본인 북마크만 조회/생성/삭제 가능
  - 성능 최적화 인덱스 추가

**관련 파일**:
- `supabase/migrations/20260113_create_profiles_and_bookmarks.sql`

---

## 추가 개선 사항

### 버그 수정 및 안정성 개선

1. **이미지 로딩 에러 해결**
   - TourAPI 이미지가 HTTP로 제공되어 `next.config.ts`에 HTTP 프로토콜 추가
   - Kakao CDN 도메인 추가 (`*.kakaocdn.net`)

2. **Null 데이터 처리**
   - 이미지 없는 이벤트: 플레이스홀더 아이콘 표시
   - 날짜 없는 이벤트: "-" 표시
   - 설명 없는 이벤트: 조건부 렌더링

3. **Next.js Image 설정 개선**
   - deprecated `images.domains` → `images.remotePatterns` 마이그레이션

**관련 커밋**:
- `fix: 행사 상세 패널 null 데이터 처리 개선`
- `fix: Next.js Image 설정에 HTTP 프로토콜 및 Kakao CDN 추가`

---

## 주요 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19
- **Authentication**: Supabase Auth + Kakao OAuth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS v4
- **TypeScript**: 엄격 모드 활성화

---

## 테스트 완료 항목

- ✅ 검색어 입력 시 실시간 필터링
- ✅ 카테고리/지역 필터 조합 테스트
- ✅ Kakao 로그인/로그아웃 플로우
- ✅ 로그인 후 프로필 정보 표시
- ✅ 이벤트 카드 클릭 시 상세 패널 표시
- ✅ 이미지 없는 이벤트 처리
- ✅ 날짜 없는 이벤트 처리

---

## 다음 주차 (Week 6) 계획

- 북마크 기능 활성화 (UI + 백엔드 연동)
- 지도 기반 이벤트 탐색 (Naver Map API)
- 사용자 맞춤 추천 알고리즘
- 마이페이지 (내 북마크 목록)

---

## 통계

- **총 작업 기간**: 1일
- **생성된 파일**: 8개
- **수정된 파일**: 7개
- **커밋 수**: 5개
- **라인 추가**: ~650줄
