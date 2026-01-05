---
description: 출근/귀가 후 최신 코드 동기화 및 개발 환경 준비 (git pull & npm install)
---

// turbo-all
이 워크플로우는 사용자가 출근 후 개발 시작을 요청했을 때 최신 상태를 유지하기 위해 실행됩니다.

1. **브랜치 전환 및 최신 코드 가져오기**
```bash
git checkout dev
git pull origin dev
```

2. **의존성 패키지 설치**
```bash
npm install
```
