# Kidsroad 1주차 개발 진행 상황

> **기간**: 1주차 (환경 설정 및 프로젝트 구조 잡기)
> **목표**: Next.js + Supabase 기본 환경 구성 및 문서화
> **상태**: 진행 중 🏃

---

## 1. 프로젝트 초기 설정 (Project Setup)

- [x] **Next.js 프로젝트 생성** (`create-next-app`)
  - [x] TypeScript 적용
  - [x] Tailwind CSS v4 설정
  - [x] Next.js 16 / React 19 환경 확인
- [x] **Git & GitHub 설정**
  - [x] 레포지토리 초기화
  - [x] `.gitignore` 설정
  - [x] 브랜치 전략 수립 (`main` - `dev`) 및 적용
- [x] **프로젝트 문서화**
  - [x] PRD (요구사항 정의서) 작성
  - [x] Git 브랜치 전략 가이드 작성
  - [x] 프로젝트 체크리스트 작성
  - [x] TODO 리스트 작성 (현재 파일)

## 2. 개발 환경 구성 (Dev Environment)

- [ ] **Lint & Formatting 설정**
  - [ ] ESLint 규칙 커스터마이징 (필요 시)
  - [ ] Prettier 설정 및 자동 저장 적용
- [ ] **폴더 구조 정의**
  - [ ] `app/` (Next.js App Router)
  - [ ] `components/` (UI 컴포넌트)
  - [ ] `lib/` 또는 `utils/` (유틸리티 함수)
  - [ ] `types/` (TypeScript 타입 정의)
  - [ ] `hooks/` (커스텀 훅)

## 3. Supabase 연동 (Backend Setup)

- [ ] **Supabase 프로젝트 생성**
  - [ ] 프로젝트 생성 및 Region 설정 (Seoul)
  - [ ] 환경 변수 (`.env.local`) 설정: API Key, URL
- [ ] **Supabase Client 설정**
  - [ ] Next.js용 Supabase 클라이언트 유틸리티 작성 (`lib/supabase.ts`)
  - [ ] TypeScript 타입 생성 (`supabase create type`)

## 4. UI 프레임워크 기초 작업

- [ ] **기본 레이아웃 구성**
  - [ ] `layout.tsx` (전역 폰트, 메타데이터 설정)
  - [ ] 모바일 퍼스트 레이아웃 컨테이너 잡기 (`max-w-md` 등)
- [ ] **아이콘 설정**
  - [ ] Lucide React 등 아이콘 라이브러리 설치

---

## 📅 다음 주 계획 (2주차 예고)

- **DB 설계 및 구축**: 공공데이터용 테이블 설계
- **API 연동 테스트**: TourAPI 호출 테스트
- **필수 기능 구현**: 헤더, 네비게이션 바 컴포넌트 개발
