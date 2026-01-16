# Kakao 로그인 설정 가이드

## 개요

Kidsroad 프로젝트에 Kakao 소셜 로그인을 연동하기 위한 단계별 가이드입니다.

---

## 📋 1단계: Kakao 개발자 등록 및 앱 생성

### 1-1. Kakao Developers 가입

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **개발자 등록** 진행 (최초 1회)

### 1-2. 애플리케이션 추가

1. 상단 메뉴에서 **내 애플리케이션** 클릭
2. **애플리케이션 추가하기** 버튼 클릭
3. 애플리케이션 정보 입력:
   - **앱 이름**: `Kidsroad` (또는 원하는 이름)
   - **사업자명**: 개인 이름 또는 회사명
   - **카테고리**: `생활/쇼핑 > 육아/교육`

### 1-3. 앱 키 확인

애플리케이션이 생성되면 **앱 설정 > 요약 정보**에서 다음 키들을 확인할 수 있습니다:

- **REST API 키**: Supabase 연동에 사용 ✅ (이것만 필요!)
- JavaScript 키: 사용 안 함
- Native 앱 키: 사용 안 함

> ⚠️ **중요**: REST API 키만 복사해두세요!

---

## 📋 2단계: Kakao 플랫폼 설정

### 2-1. 플랫폼 등록

1. **앱 설정 > 플랫폼** 메뉴로 이동
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 등록:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션: `https://your-domain.vercel.app` (나중에 추가)

### 2-2. Redirect URI 설정

1. **제품 설정 > Kakao 로그인** 메뉴로 이동
2. **Kakao 로그인 활성화** 토글을 **ON**으로 설정
3. **Redirect URI 등록** 섹션에서 다음 URI 추가:

#### 개발 환경

```
http://localhost:54321/auth/v1/callback
```

#### 프로덕션 환경 (나중에 추가)

```
https://pajxzcnddwnknhbddbws.supabase.co/auth/v1/callback
```

> 💡 **설명**: Supabase Auth는 `/auth/v1/callback` 엔드포인트를 사용합니다.

### 2-3. 동의 항목 설정

1. **제품 설정 > Kakao 로그인 > 동의항목** 메뉴로 이동
2. 다음 항목들을 **필수 동의**로 설정:
   - **닉네임**: 필수 동의 ✅
   - **프로필 사진**: 선택 동의 (또는 필수)
   - **카카오계정(이메일)**: 필수 동의 ✅

> ⚠️ **주의**: 이메일은 비즈 앱 전환 후 사용 가능합니다. 개발 단계에서는 **닉네임**만 필수로 설정하세요.

---

## 📋 3단계: Supabase에 OAuth 제공자 등록

### 3-1. Supabase 콘솔 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **Kidsroad** 프로젝트 선택
3. 좌측 메뉴에서 **Authentication > Providers** 클릭

### 3-2. Kakao Provider 설정

1. **Kakao** 제공자 찾기
2. **Enable** 토글을 **ON**으로 설정
3. 다음 정보 입력:

   - **Client ID**: Kakao REST API 키 입력
   - **Client Secret**: 입력하지 않음 (Kakao는 Client Secret 불필요)
   - **Redirect URL**: 자동 생성됨 (확인만 하세요)

4. **Save** 버튼 클릭

---

## 📋 4단계: 환경 변수 설정 (완료됨 ✅)

다음 환경 변수들이 이미 설정되어 있습니다:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://pajxzcnddwnknhbddbws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

추가 환경 변수는 필요 없습니다!

---

## ✅ 완료 체크리스트

설정을 완료했다면 다음 항목들을 확인하세요:

- [ ] Kakao Developers에서 앱 생성 완료
- [ ] REST API 키 확보 완료
- [ ] Web 플랫폼 등록 완료 (`localhost:3000`)
- [ ] Redirect URI 등록 완료 (`/auth/v1/callback`)
- [ ] 동의 항목 설정 완료 (닉네임 필수)
- [ ] Supabase에 Kakao Provider 등록 완료 (Client ID = REST API 키)

---

## 📌 다음 단계

위 설정을 모두 완료하셨다면, 다음 정보를 Claude에게 알려주세요:

```
Kakao REST API 키: [여기에 붙여넣기]
```

이후 다음 작업이 진행됩니다:

1. Next.js에 Kakao 로그인 버튼 UI 추가
2. Supabase Auth 연동 코드 구현
3. 로그인 후 사용자 프로필 저장 (`profiles` 테이블)
4. 북마크 기능을 위한 `bookmarks` 테이블 생성

---

## 🔧 트러블슈팅

### 문제: Redirect URI 오류

**증상**: 로그인 시 "redirect_uri mismatch" 에러
**해결**:

- Kakao Developers에서 등록한 Redirect URI와 Supabase의 Callback URL이 일치하는지 확인
- `http://localhost:54321/auth/v1/callback` (개발)
- `https://[프로젝트ID].supabase.co/auth/v1/callback` (프로덕션)

### 문제: 이메일 동의 항목 설정 불가

**증상**: 이메일을 필수 동의로 설정할 수 없음
**해결**:

- 개발 단계에서는 닉네임만 사용
- 비즈 앱 전환 후 이메일 사용 가능 (추후 진행)

### 문제: Supabase에서 Kakao Provider가 보이지 않음

**증상**: Authentication > Providers에 Kakao가 없음
**해결**:

- Supabase 프로젝트가 최신 버전인지 확인
- 페이지 새로고침 후 재확인

---

## 📚 참고 문서

- [Kakao Developers 문서](https://developers.kakao.com/docs)
- [Supabase Auth with Kakao](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [Next.js App Router Auth 패턴](https://supabase.com/docs/guides/auth/server-side/nextjs)
