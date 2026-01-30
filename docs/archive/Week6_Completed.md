# Week 6 완료 보고서

> **기간**: 6주차 (지도 연동 및 북마크 기능)
> **목표**: 사용자가 지도에서 이벤트를 탐색하고, 관심 있는 이벤트를 북마크할 수 있는 기능을 구현합니다.
> **상태**: 완료 ✅

---

## 완료된 작업

### 1. 북마크(찜하기) 기능 구현 ✅

- ✅ 이벤트 카드에 북마크 버튼 추가
  - Material Symbols 아이콘 사용
  - 북마크 상태에 따른 아이콘 색상 변경
  - Hover 효과 적용
- ✅ 북마크 추가/삭제 API 로직 구현
  - `toggleBookmark()` Server Action 생성
  - Supabase `bookmarks` 테이블 연동
  - 중복 북마크 방지 (UNIQUE 제약)
- ✅ 북마크 상태 실시간 반영 (낙관적 업데이트)
  - `useOptimistic` 훅 활용
  - UI 즉시 반영 후 서버 동기화
  - 에러 시 롤백 처리
- ✅ 로그인하지 않은 사용자 처리
  - 인증 확인 로직
  - "로그인이 필요한 서비스입니다" 토스트 알림

**관련 파일**:
- `lib/bookmarks.ts` - Server Actions (toggleBookmark, getUserBookmarkedEventIds, isEventBookmarked)
- `components/EventCard.tsx` - 북마크 버튼 UI 및 인터랙션

### 2. 마이페이지 구현 ✅

- ✅ 마이페이지 라우트 생성 (`/my`)
  - Server Component로 구현
  - 미로그인 시 리다이렉트 처리
- ✅ 사용자 프로필 정보 표시
  - Supabase `profiles` 테이블 조회
  - 아바타 이미지 및 닉네임 표시
  - 기본 프로필 (첫 글자) 폴백 처리
- ✅ 내 북마크 목록 조회 및 표시
  - `bookmarks` + `events` 테이블 JOIN 쿼리
  - EventCard 컴포넌트 재사용
  - 날짜 기준 정렬
- ✅ 북마크 삭제 기능
  - EventCard의 toggleBookmark 활용
  - 삭제 시 페이지 자동 갱신

**관련 파일**:
- `app/my/page.tsx` - 마이페이지 메인
- `app/my/layout.tsx` - 마이페이지 레이아웃
- `app/my/loading.tsx` - 로딩 스켈레톤

### 3. 지도 기반 탐색 (Naver Map API) ✅

- ✅ Naver Map 컴포넌트 구현
  - `components/NaverMap.tsx` 생성
  - Naver Maps API v3 스크립트 로드
  - TypeScript 타입 선언
- ✅ 이벤트 마커 표시 (위치 기반)
  - `mapx`, `mapy` 좌표 기반 마커 생성
  - LatLngBounds로 자동 줌/중심 조정
  - 마커별 고유 키 관리
- ✅ 마커 클릭 시 이벤트 상세 정보 표시
  - InfoWindow로 제목/주소 표시
  - `onEventSelect` 콜백으로 DetailPanel 연동
  - 클릭 이벤트 리스너 관리
- ✅ 지도 영역 기반 이벤트 필터링
  - `idle` 이벤트로 Bounds 변경 감지
  - "이 지역에서 검색" 버튼 오버레이
  - 필터링된 이벤트 목록 업데이트
- ✅ 리스트/지도 뷰 전환
  - `EventView` 컴포넌트에 뷰 모드 상태 추가
  - 토글 버튼 UI 구현
  - 뷰 전환 시 상태 유지

**관련 파일**:
- `components/NaverMap.tsx` - 지도 컴포넌트
- `components/EventView.tsx` - 리스트/지도 뷰 통합
- `app/layout.tsx` - Naver Maps 스크립트 로드
- `.env.example` - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 추가

### 4. UX 개선 ✅

- ✅ 로딩 스켈레톤 개선
  - `app/my/loading.tsx` 추가
  - 프로필 + 북마크 그리드 스켈레톤
- ✅ 빈 상태(Empty State) UI 추가
  - 북마크 없을 시 탐색 유도 메시지
  - 일러스트 아이콘 사용
  - "행사 둘러보기" 링크 제공
- ✅ 에러 상태 UI 개선
  - Toast 알림 시스템 구현
  - `components/ui/Toast.tsx` 생성
  - ToastProvider + useToast 훅
  - 성공/에러/정보 타입별 스타일링
- ✅ 모바일 반응형 최적화
  - DetailPanel 오버레이 최적화
  - 지도 영역 필터 버튼 모바일 대응
  - 터치 이벤트 최적화

**관련 파일**:
- `app/my/loading.tsx`
- `components/ui/Toast.tsx`
- `app/layout.tsx` - ToastProvider 추가
- `components/EventView.tsx` - 반응형 개선

---

## 추가 개선 사항

### 북마크 UX 개선

1. **낙관적 업데이트**
   - `useTransition` 훅으로 비차단 업데이트
   - UI 즉시 반영 → 서버 동기화
   - 에러 시 자동 롤백

2. **토스트 알림 통합**
   - 북마크 추가: "관심 행사에 저장되었습니다"
   - 북마크 삭제: "저장이 취소되었습니다"
   - 에러: "로그인이 필요한 서비스입니다" / "오류가 발생했습니다"

3. **중복 클릭 방지**
   - `isPending` 플래그로 요청 중 버튼 비활성화

### 지도 성능 최적화

1. **마커 이벤트 리스너 관리**
   - useEffect cleanup으로 메모리 누수 방지
   - 컴포넌트 언마운트 시 리스너 제거

2. **Bounds 기반 필터링**
   - 화면에 보이는 이벤트만 표시
   - 대량 데이터 성능 개선

**관련 커밋**:
- `feat: 지도 영역 필터링 및 토스트 알림 UX 구현`
- `feat: 지도 뷰 토글 통합 및 북마크 상호작용 개선`

---

## 주요 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19
- **Map**: Naver Maps API v3
- **State Management**: React Hooks (useState, useEffect, useTransition, useOptimistic)
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS v4
- **Icons**: Material Symbols Outlined

---

## 테스트 완료 항목

- ✅ 북마크 추가/삭제 (로그인/비로그인)
- ✅ 마이페이지 프로필 및 북마크 목록 표시
- ✅ 지도 마커 렌더링 (단일/다중 이벤트)
- ✅ 지도 영역 필터링 정확도
- ✅ 리스트 ↔ 지도 뷰 전환
- ✅ 토스트 알림 표시/자동 숨김
- ✅ 모바일 반응형 (지도, 북마크, 마이페이지)
- ✅ 다크 모드 일관성

---

## 다음 주차 (Week 7) 계획

- QA 및 버그 수정
- 성능 최적화 (Lighthouse 점수 90+ 목표)
- 크로스 브라우저 테스트 (Chrome, Safari, Samsung Internet)
- 접근성 개선 (키보드 네비게이션, ARIA 속성)

---

## 통계

- **총 작업 기간**: 1일
- **생성된 파일**: 4개
- **수정된 파일**: 5개
- **커밋 수**: 5개
- **라인 추가**: ~800줄
