---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*)
argument-hint: [message] | --no-verify | --amend
description: Create well-formatted commits with conventional commit format and emoji
---

# Smart Git Commit

Create well-formatted commit: $ARGUMENTS

## Current Repository State

- Git status: !`git status --porcelain`
- Current branch: !`git branch --show-current`
- Staged changes: !`git diff --cached --stat`
- Unstaged changes: !`git diff --stat`
- Recent commits: !`git log --oneline -5`

## What This Command Does

1. Unless specified with `--no-verify`, automatically runs pre-commit checks:
   - `pnpm lint` to ensure code quality
   - `pnpm build` to verify the build succeeds
   - `pnpm generate:docs` to update documentation
2. Checks which files are staged with `git status`
3. If 0 files are staged, automatically adds all modified and new files with `git add`
4. Performs a `git diff` to understand what changes are being committed
5. Analyzes the diff to determine if multiple distinct logical changes are present
6. If multiple distinct changes are detected, suggests breaking the commit into multiple smaller commits
7. For each commit (or the single commit if not split), creates a commit message using emoji conventional commit format

## Best Practices for Commits

- **Verify before committing**: Ensure code is linted, builds correctly, and documentation is updated
- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Conventional commit format**: Use the format `<type>: <description>` where type is one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `perf`: Performance improvements
  - `test`: Adding or fixing tests
  - `chore`: Changes to the build process, tools, etc.
- **CRITICAL: ALWAYS write commit messages in KOREAN ONLY** (커밋 메시지는 반드시 한글로 작성)
  - Example: "feat: 사용자 인증 시스템 추가" (NOT "add user authentication system")
  - Use clear Korean verbs: 추가, 수정, 제거, 개선, 업데이트, 해결 등
- **Concise first line**: Keep the first line under 72 characters
- **Emoji**: Each commit type is paired with an appropriate emoji:
  - ✨ `feat`: New feature
  - 🐛 `fix`: Bug fix
  - 📝 `docs`: Documentation
  - 💄 `style`: Formatting/style
  - ♻️ `refactor`: Code refactoring
  - ⚡️ `perf`: Performance improvements
  - ✅ `test`: Tests
  - 🔧 `chore`: Tooling, configuration
  - 🚀 `ci`: CI/CD improvements
  - 🗑️ `revert`: Reverting changes
  - 🧪 `test`: Add a failing test
  - 🚨 `fix`: Fix compiler/linter warnings
  - 🔒️ `fix`: Fix security issues
  - 👥 `chore`: Add or update contributors
  - 🚚 `refactor`: Move or rename resources
  - 🏗️ `refactor`: Make architectural changes
  - 🔀 `chore`: Merge branches
  - 📦️ `chore`: Add or update compiled files or packages
  - ➕ `chore`: Add a dependency
  - ➖ `chore`: Remove a dependency
  - 🌱 `chore`: Add or update seed files
  - 🧑‍💻 `chore`: Improve developer experience
  - 🧵 `feat`: Add or update code related to multithreading or concurrency
  - 🔍️ `feat`: Improve SEO
  - 🏷️ `feat`: Add or update types
  - 💬 `feat`: Add or update text and literals
  - 🌐 `feat`: Internationalization and localization
  - 👔 `feat`: Add or update business logic
  - 📱 `feat`: Work on responsive design
  - 🚸 `feat`: Improve user experience / usability
  - 🩹 `fix`: Simple fix for a non-critical issue
  - 🥅 `fix`: Catch errors
  - 👽️ `fix`: Update code due to external API changes
  - 🔥 `fix`: Remove code or files
  - 🎨 `style`: Improve structure/format of the code
  - 🚑️ `fix`: Critical hotfix
  - 🎉 `chore`: Begin a project
  - 🔖 `chore`: Release/Version tags
  - 🚧 `wip`: Work in progress
  - 💚 `fix`: Fix CI build
  - 📌 `chore`: Pin dependencies to specific versions
  - 👷 `ci`: Add or update CI build system
  - 📈 `feat`: Add or update analytics or tracking code
  - ✏️ `fix`: Fix typos
  - ⏪️ `revert`: Revert changes
  - 📄 `chore`: Add or update license
  - 💥 `feat`: Introduce breaking changes
  - 🍱 `assets`: Add or update assets
  - ♿️ `feat`: Improve accessibility
  - 💡 `docs`: Add or update comments in source code
  - 🗃️ `db`: Perform database related changes
  - 🔊 `feat`: Add or update logs
  - 🔇 `fix`: Remove logs
  - 🤡 `test`: Mock things
  - 🥚 `feat`: Add or update an easter egg
  - 🙈 `chore`: Add or update .gitignore file
  - 📸 `test`: Add or update snapshots
  - ⚗️ `experiment`: Perform experiments
  - 🚩 `feat`: Add, update, or remove feature flags
  - 💫 `ui`: Add or update animations and transitions
  - ⚰️ `refactor`: Remove dead code
  - 🦺 `feat`: Add or update code related to validation
  - ✈️ `feat`: Improve offline support

## Guidelines for Splitting Commits

When analyzing the diff, consider splitting commits based on these criteria:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different types of changes**: Mixing features, fixes, refactoring, etc.
3. **File patterns**: Changes to different types of files (e.g., source code vs documentation)
4. **Logical grouping**: Changes that would be easier to understand or review separately
5. **Size**: Very large changes that would be clearer if broken down

## Examples

Good commit messages (한글 커밋 메시지 예시):

- ✨ feat: 사용자 인증 시스템 추가
- 🐛 fix: 렌더링 프로세스 메모리 누수 해결
- 📝 docs: 새로운 엔드포인트 포함하여 API 문서 업데이트
- ♻️ refactor: 파서의 에러 핸들링 로직 단순화
- 🚨 fix: 컴포넌트 파일의 린터 경고 해결
- 🧑‍💻 chore: 개발자 도구 설정 프로세스 개선
- 👔 feat: 트랜잭션 검증을 위한 비즈니스 로직 구현
- 🩹 fix: 헤더의 사소한 스타일 불일치 수정
- 🚑️ fix: 인증 플로우의 치명적인 보안 취약점 패치
- 🎨 style: 더 나은 가독성을 위해 컴포넌트 구조 재구성
- 🔥 fix: 더 이상 사용하지 않는 레거시 코드 제거
- 🦺 feat: 사용자 등록 폼에 입력 유효성 검사 추가
- 💚 fix: 실패한 CI 파이프라인 테스트 해결
- 📈 feat: 사용자 참여도 분석 트래킹 구현
- 🔒️ fix: 인증 비밀번호 요구사항 강화
- ♿️ feat: 스크린 리더를 위한 폼 접근성 개선

Example of splitting commits (커밋 분리 예시):

- First commit: ✨ feat: 새로운 solc 버전 타입 정의 추가
- Second commit: 📝 docs: 새로운 solc 버전에 대한 문서 업데이트
- Third commit: 🔧 chore: package.json 의존성 업데이트
- Fourth commit: 🏷️ feat: 새로운 API 엔드포인트 타입 정의 추가
- Fifth commit: 🧵 feat: 워커 스레드의 동시성 처리 개선
- Sixth commit: 🚨 fix: 새 코드의 린팅 이슈 해결
- Seventh commit: ✅ test: 새로운 solc 버전 기능에 대한 단위 테스트 추가
- Eighth commit: 🔒️ fix: 보안 취약점이 있는 의존성 업데이트

## Command Options

- `--no-verify`: Skip running the pre-commit checks (lint, build, generate:docs)

## Important Notes

- By default, pre-commit checks (`pnpm lint`, `pnpm build`, `pnpm generate:docs`) will run to ensure code quality
- If these checks fail, you'll be asked if you want to proceed with the commit anyway or fix the issues first
- If specific files are already staged, the command will only commit those files
- If no files are staged, it will automatically stage all modified and new files
- The commit message will be constructed based on the changes detected
- Before committing, the command will review the diff to identify if multiple commits would be more appropriate
- If suggesting multiple commits, it will help you stage and commit the changes separately
- Always reviews the commit diff to ensure the message matches the changes
