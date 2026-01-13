# Kidsroad 3주차 개발 목표

> **기간**: 3주차 (데이터 파이프라인 구축)
> **목표**: 데이터 수집 자동화 및 정제 로직 고도화
> **상태**: 완료 ✅ 2026-01-13

---

## 1. 데이터 수집 자동화 (Automation)

- [x] **Vercel Cron 설정**
  - [x] `vercel.json` 파일 생성 또는 수정하여 Cronjob 정의
  - [x] `scripts/collect-events.ts`를 실행하는 API Route 생성 (`app/api/cron/collect-events/route.ts`)
  - [x] 매일 새벽 3시에 스크립트가 실행되도록 스케줄링
- [x] **보안 강화**
  - [x] Cronjob API Route에 Secret Key 인증 추가하여 무단 실행 방지

## 2. 데이터 정제 및 고도화 (Enrichment)

- [x] **`utils/mapper.ts` 개선**
  - [x] 블로그 검색 및 AI 분석을 통한 데이터 정제/보강으로 대체
- [x] **자동 태그 생성 로직 구현**
  - [x] `events` 테이블의 `tags` 필드를 채우는 함수 작성
  - [x] `title`과 `description`을 분석하여 '체험형', '교육적', '야외활동' 등 유의미한 태그 자동 생성
- [x] **데이터 수집 스크립트 업데이트**
  - [x] `scripts/collect-events.ts`에 자동 태그 생성 로직 연동

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 2**: [DB 구축 및 API 연동 완료](archive/Week2_Completed.md)
