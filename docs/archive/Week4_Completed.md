# Kidsroad 4주차 개발 목표

> **기간**: 4주차 (Core UI 개발)
> **목표**: 실제 DB 데이터를 화면에 표시하고 UI 완성도를 높입니다.
> **상태**: 완료 ✅ 2026-01-13

---

## 1. DB 데이터 연동 (Data-UI Binding)

- [x] **`app/page.tsx` 서버 컴포넌트 전환**
  - [x] `async` 함수로 변경하여 Supabase 데이터 직접 조회
  - [x] 하드코딩된 `dummyEvents` 배열 및 관련 코드 제거
- [x] **데이터 로딩 및 에러 상태 처리**
  - [x] `loading.tsx`가 정상 작동하는지 확인
  - [x] 데이터가 없을 경우 "표시할 이벤트가 없습니다" 메시지 표시
- [x] **`EventCard.tsx` 프롭스 타입 검증**
  - [x] DB에서 가져온 데이터 타입과 컴포넌트 프롭스 타입이 일치하는지 확인 및 수정

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 3**: [데이터 파이프라인 구축 완료](archive/Week3_Completed.md)
