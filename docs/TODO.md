# Kidsroad 5주차 개발 목표

> **기간**: 5주차 (검색 및 필터 기능)
> **목표**: 사용자가 원하는 정보를 쉽게 찾을 수 있도록 핵심 검색 및 필터 기능을 구현합니다.
> **상태**: 시작 전 ⬜

---

## 1. 검색 및 필터 UI 구현

- [x] 메인 페이지에 검색 입력 필드 추가
- [x] 카테고리(예: '축제', '교육', '체험') 필터 UI 구현
- [x] 지역 필터 UI 구현 (시/도 단위)

## 2. Supabase 쿼리 연동

- [x] 검색어에 따라 `events` 테이블을 필터링하는 Supabase 쿼리 로직 구현
- [x] 선택된 카테고리에 따라 `events` 테이블을 필터링하는 Supabase 쿼리 로직 구현
- [x] 선택된 지역에 따라 `events` 테이블을 필터링하는 Supabase 쿼리 로직 구현

## 3. 사용자 인증 기능 (Kakao 로그인)

- [x] Kakao 개발자 등록 및 API 키 발급
- [x] Supabase Auth에 Kakao OAuth 연동 설정
- [x] Next.js 앱에 Kakao 로그인 UI 및 인증 흐름 구현

## 4. `profiles` 테이블 생성 및 연동

- [x] `profiles` 테이블 스키마 설계 (사용자 닉네임, 프로필 이미지 등)
- [x] Supabase에서 `profiles` 테이블 생성
- [x] 사용자 가입 시 `profiles` 테이블에 기본 정보 저장 로직 구현

## 5. `bookmarks` 테이블 생성

- [x] `bookmarks` 테이블 스키마 설계 (사용자 ID, 이벤트 ID)
- [x] Supabase에서 `bookmarks` 테이블 생성

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 4**: [Core UI 개발 (메인, 리스트, 상세 페이지)](archive/Week4_Completed.md)
