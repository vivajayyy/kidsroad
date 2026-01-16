# 텔레그램 알림 설정 가이드

Cron 실행 결과를 텔레그램으로 받아보는 방법입니다.

## 1단계: 텔레그램 봇 생성

1. 텔레그램 앱에서 [@BotFather](https://t.me/BotFather) 검색
2. `/newbot` 명령어 입력
3. 봇 이름 입력 (예: Kidsroad Cron Monitor)
4. 봇 사용자명 입력 (예: kidsroad_cron_bot)
5. 봇 토큰 복사 (예: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2단계: Chat ID 확인

### 방법 1: 개인 채팅 (권장)

1. 생성한 봇과 채팅 시작
2. 아무 메시지나 전송 (예: `/start`)
3. 브라우저에서 접속:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. 응답에서 `chat.id` 값 복사 (예: `123456789`)

### 방법 2: 그룹 채팅

1. 텔레그램 그룹 생성
2. 봇을 그룹에 추가
3. 그룹에 아무 메시지나 전송
4. 위 URL로 접속하여 `chat.id` 확인 (그룹은 음수로 표시됨, 예: `-1001234567890`)

## 3단계: 환경 변수 설정

### 로컬 개발 (.env.local)

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### Vercel 배포

1. Vercel Dashboard 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:
   - `TELEGRAM_BOT_TOKEN`: 봇 토큰
   - `TELEGRAM_CHAT_ID`: Chat ID
4. Environment: **Production** 체크

## 4단계: 테스트

로컬에서 테스트:

```bash
npx tsx scripts/collect-events.ts
```

성공 시 텔레그램으로 다음과 같은 메시지를 받습니다:

```
✅ Kidsroad Cron 실행 완료

⏰ 실행 시각: 2026. 1. 16. 오전 1:23:45
⏱️ 소요 시간: 45.2초

📊 결과
• 전체: 24개
• 처리: 24개
• Enrichment: 5개
• 스킵: 19개
• 오류: 0개

💰 비용 절감: 79.2% (AI 호출 19회 스킵)
```

## 알림 비활성화

텔레그램 알림을 받고 싶지 않다면:
- 환경 변수를 설정하지 않으면 자동으로 비활성화됩니다.
- 로그는 여전히 Supabase에 저장되어 언제든 조회 가능합니다.

## 문제 해결

### 알림이 안 옴

1. 봇 토큰과 Chat ID 확인
2. 봇과 대화를 시작했는지 확인 (첫 메시지 전송)
3. Vercel 로그 확인:
   ```
   [Telegram] 전송 완료
   ```

### 오류 메시지

- `Unauthorized`: 잘못된 봇 토큰
- `Bad Request: chat not found`: 잘못된 Chat ID 또는 봇과 대화 시작 안 함
- `Forbidden: bot was blocked by the user`: 봇을 차단한 상태 (차단 해제 필요)
