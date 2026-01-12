# Kidsroad 3주차 개발 목표

> **기간**: 3주차 (데이터 파이프라인 구축)
> **목표**: 데이터 수집 자동화 및 정제 로직 고도화
> **상태**: 시작 전 ⬜

---

## 1. 데이터 수집 자동화 (Automation)

- [ ] **Vercel Cron 설정**
  - [ ] `vercel.json` 파일 생성 또는 수정하여 Cronjob 정의
  - [ ] `scripts/collect-events.ts`를 실행하는 API Route 생성 (`app/api/cron/collect-events/route.ts`)
  - [ ] 매일 새벽 3시에 스크립트가 실행되도록 스케줄링
- [ ] **보안 강화**
  - [ ] Cronjob API Route에 Secret Key 인증 추가하여 무단 실행 방지

## 2. 데이터 정제 및 고도화 (Enrichment)

- [ ] **`utils/mapper.ts` 개선**
  - [ ] `detailCommon2` API 호출 실패 문제 해결 또는 대안 모색
  - [ ] 주차, 유모차 등 부모 체크리스트 필드에 대한 추론 로직 보강
    - `docs/DATA_COVERAGE_ANALYSIS.md`에 따라 키워드 기반 추론 규칙 추가
- [ ] **자동 태그 생성 로직 구현**
  - [ ] `events` 테이블의 `tags` 필드를 채우는 함수 작성
  - [ ] `title`과 `description`을 분석하여 '체험형', '교육적', '야외활동' 등 유의미한 태그 자동 생성
- [ ] **데이터 수집 스크립트 업데이트**
  - [ ] `scripts/collect-events.ts`에 자동 태그 생성 로직 연동

---

## 📅 지난 주 완료 사항 (Archive)

- [x] **Week 2**: [DB 구축 및 API 연동 완료](archive/Week2_Completed.md)
