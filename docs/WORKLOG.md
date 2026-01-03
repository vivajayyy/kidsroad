# 🛠️ 개발 작업 일지 (Work Log)

> 날짜별 주요 개발 사항, 버그 수정, 이슈 해결 내역을 기록합니다.
> 최신 내역이 상단에 위치합니다.

---

## 2026-01-03 (토)

### 🔧 코드 품질 도구 설정

- **분류**: `Setup` / `Code Quality`
- **작업 내용**:
  - Prettier 설정 추가
    - `.prettierrc`: 코드 포맷팅 규칙 설정
    - `.prettierignore`: 포맷팅 제외 파일 목록
    - `package.json`에 `format`, `format:check` 스크립트 추가
  - ESLint 설정 업데이트
    - `eslint.config.mjs`: Prettier 통합 설정 추가
    - `eslint-config-prettier`, `eslint-plugin-prettier` 의존성 추가
  - `CLAUDE.md` 파일 추가: Claude Code를 위한 프로젝트 가이드 문서
  - `docs/TODO.md` 업데이트
- **관련 파일**:
  - `.prettierrc`
  - `.prettierignore`
  - `eslint.config.mjs`
  - `package.json`
  - `package-lock.json`
  - `CLAUDE.md`
  - `docs/TODO.md`

## 2026-01-02 (금)

### 📝 프로젝트 초기화 및 문서 작성

- **분류**: `Setup` / `Docs`
- **작업 내용**:
  - Next.js 16 + React 19 + Tailwind CSS v4 환경 구성 확인
  - `docs/` 디렉토리 생성 및 기획 문서 세트 작성
    - `PRD.md`: 요구사항 정의
    - `git_branch_guide.md`: 브랜치 전략 가이드
    - `project_checklist.md`: 1인 개발 체크리스트
    - `ROADMAP.md`: 전체 일정 관리 마일스톤
    - `TODO.md`: 주간 할 일 관리
  - Git 저장소 초기화 및 `dev` 브랜치 생성, 원격 저장소 연동
- **관련 파일**:
  - `docs/*`
  - `package.json`
