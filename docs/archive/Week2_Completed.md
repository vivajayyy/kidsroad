# Kidsroad 2주차 개발 진행 상황

> **기간**: 2주차 (DB 구조 설계 및 데이터 수집)
> **목표**: Supabase 스키마 구축 및 공공데이터(TourAPI) 연동
> **상태**: 진행 중 🏃

---

## 1. 데이터베이스 설계 및 구축 (Database)

- [x] **Supabase CLI 설치 및 프로젝트 연결**
  - [x] Homebrew로 Supabase CLI 설치
  - [x] 프로젝트 연결 (`supabase link`)
  - [x] 로컬 환경 초기화 (`supabase init`)
- [x] **Supabase 테이블 설계 (Schema Design)**
  - [x] `events`: 축제/행사 정보 테이블 (34개 필드)
    - TourAPI 매핑 필드: contentid, title, addr1/2, mapx/mapy, 이미지, 날짜 등
    - Kidsroad 특화: age_ranges, 부모 체크리스트 (유모차, 주차 등)
    - 시스템 필드: data_source, is_published, created_at, updated_at
  - [x] 7개 전략적 인덱스 설계 (날짜, 위치, 연령, 태그, 검색, 카테고리, 체크리스트)
  - [x] RLS 정책 설계 (anon 읽기, service_role 전체 권한)
- [x] **데이터베이스 생성**
  - [x] 마이그레이션 파일 생성 (`supabase/migrations/20260105_create_events_table.sql`)
  - [x] 원격 DB에 테이블 생성 (`supabase db push`)
  - [x] TypeScript 타입 자동 생성 (`types/supabase.ts`)
  - [x] 데이터 삽입/조회 테스트 완료

## 2. 공공데이터 API 연동 (TourAPI)

- [x] **API 환경 설정 및 타입 정의**
  - [x] 한국관광공사 TourAPI 활용신청 및 인증키(Decoding Key) 발급 (공공데이터포털 data.go.kr 이용)
  - [x] TourAPI 활용 가이드 문서 작성 (`docs/TOUR_API_GUIDE.md`)
  - [x] `.env.local`에 API Key 환경변수 등록 (`NEXT_PUBLIC_TOUR_API_KEY`)
  - [x] TourAPI 응답 데이터 타입(Interface) 정의 (`types/tour-api.ts`)
- [ ] **데이터 수집 로직 구현 (Data Fetching)**
  - [ ] `lib/tour-api.ts`: API 호출 및 데이터 Fetching 유틸리티 구현
  - [ ] `utils/mapper.ts`: TourAPI 데이터 -> Supabase DB 스키마 변환 함수 작성
  - [ ] 데이터 저장 스크립트 작성 및 테스트 (터미널 실행)

## 3. 메인 페이지 UI 구현 (UI Implementation)

- [ ] **데이터 조회 기능 (Data Fetching)**
  - [ ] `lib/events.ts`: Supabase에서 행사 목록 조회 함수 작성 (`getEvents`)
  - [ ] Server Component(`app/page.tsx`)에서 데이터 호출 연결
- [ ] **리스트 UI 구현**
  - [ ] `components/EventCard.tsx`: 행사 정보 카드 컴포넌트 생성 (이미지, 제목, 날짜)
  - [ ] `app/page.tsx`: Grid 레이아웃 적용 및 카드 리스트 렌더링
  - [ ] 빈 상태(Empty State) 및 로딩(Skeleton) UI 처리

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 1**: [환경 설정 및 배포 완료](archive/Week1_Foundation.md)
