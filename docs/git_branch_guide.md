# Git 브랜치 전략 가이드

> **1인 개발 기준 단계별 브랜치 전략**

> 최종 수정일: 2024년 12월

---

## 목차

1. 개요
2. 브랜치 전략 비교
3. 단계별 전략
4. 커밋 규칙
5. 실전 워크플로우

---

# 1. 개요

## 1.1 목적

1인 개발 환경에서 효율적이고 안전한 Git 브랜치 관리 방법을 정의합니다.

## 1.2 핵심 원칙

- **단순함 우선**: 1인 개발에서는 복잡한 브랜치 전략보다 실용성이 중요
- **안정성 확보**: 프로덕션 배포 전 테스트 가능한 구조
- **단계적 확장**: 프로젝트 성장에 따라 전략 확장

---

# 2. 브랜치 전략 비교

| 전략                     | 구조                    | 장점                             | 단점                                    | 추천 상황                     |
| ------------------------ | ----------------------- | -------------------------------- | --------------------------------------- | ----------------------------- |
| **main만**               | main                    | 단순함, 빠른 배포                | 롤백 어려움, 실수 시 바로 프로덕션 영향 | 초기 MVP, 프로토타입          |
| **main + dev**           | main ← dev              | 안정성 확보, 배포 전 테스트 가능 | 약간의 관리 오버헤드                    | MVP 이후, 실 사용자 있을 때   |
| **main + dev + feature** | main ← dev ← feature/\* | 기능별 히스토리 관리, 이슈 연동  | 1인에겐 과한 관리 부담                  | 팀 확장 예정, 복잡한 프로젝트 |

---

# 3. 단계별 전략

## 3.1 Phase 1: MVP 개발 중 (현재)

### 브랜치 구조

```
main (배포용)
  └── dev (개발용)
```

### 운영 방법

- `dev` 브랜치에서 모든 개발 진행
- 기능 완성 시 `main`으로 머지 → Vercel 자동 배포
- 이슈는 GitHub Issues로 간단히 관리 (브랜치까지 안 만들어도 됨)

### 장점

- 단순하지만 안정성 확보
- main은 항상 배포 가능한 상태 유지
- 실수로 미완성 코드가 프로덕션에 배포되는 것 방지

---

## 3.2 Phase 2: 출시 후 사용자 생기면

### 브랜치 구조

```
main (프로덕션)
  └── dev (개발/테스트)
        └── feature/기능명 (필요시에만)
```

### 운영 방방

- 큰 기능 추가할 때만 feature 브랜치 생성
- hotfix 필요하면 `main`에서 바로 수정 후 `dev`에 머지
- feature 브랜치 이름 예시:
  - `feature/user-review`
  - `feature/event-report`
  - `feature/push-notification`

### feature 브랜치 사용 기준

| 상황                    | feature 브랜치 | 이유                   |
| ----------------------- | -------------- | ---------------------- |
| 간단한 버그 수정        | ❌ 불필요      | dev에서 바로 수정      |
| UI 미세 조정            | ❌ 불필요      | dev에서 바로 수정      |
| 새로운 페이지/기능 추가 | ✅ 필요        | 2일 이상 소요되는 작업 |
| 대규모 리팩토링         | ✅ 필요        | 기존 코드에 영향 큼    |
| 외부 API 연동 추가      | ✅ 필요        | 테스트 필요            |

---

## 3.3 Phase 3: 팀 확장 시

### 브랜치 구조

```
main (프로덕션)
  └── dev (개발 통합)
        ├── feature/기능명
        ├── feature/다른기능
        └── hotfix/긴급수정
```

### 운영 방법

- 모든 기능은 feature 브랜치에서 개발
- PR(Pull Request) 통한 코드 리뷰
- 이슈 번호와 브랜치 연동 (예: `feature/#12-user-review`)

---

# 4. 커밋 규칙

## 4.1 커밋 메시지 형식

```
<type>: <설명>
```

## 4.2 Type 종류

| Type         | 설명                           | 예시                         |
| ------------ | ------------------------------ | ---------------------------- |
| **feat**     | 새로운 기능 추가               | feat: 검색 필터 추가         |
| **fix**      | 버그 수정                      | fix: 상세페이지 오류 수정    |
| **refactor** | 코드 리팩토링 (기능 변경 없음) | refactor: API 호출 로직 개선 |
| **style**    | 코드 포맷팅 (기능 변경 없음)   | style: 코드 정렬             |
| **docs**     | 문서 수정                      | docs: README 업데이트        |
| **chore**    | 빌드, 설정 변경                | chore: 패키지 업데이트       |
| **test**     | 테스트 추가/수정               | test: 필터 테스트 추가       |

## 4.3 좋은 커밋 메시지 예시

```
feat: 연령별 필터 기능 추가
fix: 모바일에서 카드 레이아웃 깨지는 문제 수정
refactor: 행사 데이터 페칭 로직 개선
docs: 환경변수 설정 가이드 추가
chore: Tailwind CSS 설정 업데이트
```

---

# 5. 실전 워크플로우

## 5.1 일반적인 개발 흐름 (Phase 1)

```
1. dev 브랜치로 이동
   $ git checkout dev

2. 최신 코드 받기
   $ git pull origin dev

3. 개발 진행 후 커밋
   $ git add .
   $ git commit -m "feat: 검색 필터 추가"

4. dev에 푸시
   $ git push origin dev

5. 기능 완성 시 main으로 머지
   $ git checkout main
   $ git merge dev
   $ git push origin main

6. 자동 배포 (Vercel)
```

## 5.2 Hotfix 흐름 (긴급 수정)

```
1. main에서 바로 수정
   $ git checkout main
   $ git pull origin main

2. 수정 후 커밋 & 푸시
   $ git add .
   $ git commit -m "fix: 긴급 버그 수정"
   $ git push origin main

3. dev에도 머지 (동기화)
   $ git checkout dev
   $ git merge main
   $ git push origin dev
```

## 5.3 Feature 브랜치 흐름 (Phase 2 이후)

```
1. dev에서 feature 브랜치 생성
   $ git checkout dev
   $ git checkout -b feature/user-review

2. 개발 진행 후 커밋
   $ git add .
   $ git commit -m "feat: 사용자 후기 기능 추가"

3. feature 브랜치 푸시
   $ git push origin feature/user-review

4. 기능 완성 시 dev로 머지
   $ git checkout dev
   $ git merge feature/user-review
   $ git push origin dev

5. feature 브랜치 삭제 (선택)
   $ git branch -d feature/user-review
   $ git push origin --delete feature/user-review
```

---

## 요약

| 단계                  | 브랜치 구조                   | 핵심 포인트                     |
| --------------------- | ----------------------------- | ------------------------------- |
| **Phase 1 (MVP)**     | main + dev                    | dev에서 개발, 완성 시 main 머지 |
| **Phase 2 (출시 후)** | main + dev + feature (필요시) | 큰 기능만 feature 브랜치        |
| **Phase 3 (팀 확장)** | main + dev + feature + hotfix | PR 기반 코드 리뷰               |

---

## 문서 이력

| 버전 | 날짜    | 작성자 | 변경 내용 |
| ---- | ------- | ------ | --------- |
| v1.0 | 2024.12 | -      | 최초 작성 |
