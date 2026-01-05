# Kidsroad 2주차 개발 진행 상황

> **기간**: 2주차 (DB 구조 설계 및 데이터 수집)
> **목표**: Supabase 스키마 구축 및 공공데이터(TourAPI) 연동
> **상태**: 시작 전 ⬜

---

## 1. 데이터베이스 설계 및 구축 (Database)

- [ ] **Supabase 테이블 설계 (Schema Design)**
  - [ ] `events`: 축제/행사 정보 테이블
  - [ ] `profiles`: 사용자 정보 테이블 (Kakao 로그인 대비)
  - [ ] `bookmarks`: 찜하기 기능 테이블
- [ ] **데이터베이스 생성**
  - [ ] Supabase Dashboard에서 테이블 생성
  - [ ] RLS (Row Level Security) 정책 설정

## 2. 공공데이터 API 연동 (TourAPI)

- [ ] **API 환경 설정**
  - [ ] 한국관광공사 TourAPI 인증키 발급 및 .env 등록
  - [ ] API 호출 테스트 (Postman / 스크립트)
- [ ] **데이터 수집 로직 구현**
  - [ ] API 데이터 -> Supabase 저장 스크립트 작성
  - [ ] 데이터 매핑 (API 응답 -> Event 스키마)

## 3. UI/UX 고도화 (선택 사항)

- [ ] **메인 페이지 UI 업데이트**
  - [ ] 실제 DB 데이터 연동해보기 (Server Component)

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 1**: [환경 설정 및 배포 완료](archive/Week1_Foundation.md)
