# Naver Map API 설정 가이드

## 개요

Kidsroad 프로젝트에 Naver Maps API v3를 연동하여 지도 기반 이벤트 탐색 기능을 활성화하기 위한 단계별 가이드입니다.

---

## 📋 1단계: Naver Cloud Platform 가입

### 1-1. 계정 생성

1. [Naver Cloud Platform](https://www.ncloud.com/) 접속
2. 우측 상단 **회원가입** 버튼 클릭
3. 네이버 계정으로 로그인 (또는 새로 생성)
4. 본인 인증 진행 (휴대폰 인증 또는 아이핀)

### 1-2. 결제 정보 등록

1. 콘솔 첫 로그인 시 **결제 수단 등록** 안내가 표시됩니다
2. 신용카드 또는 체크카드 등록
   - 무료 플랜에서도 결제 수단 등록이 필요합니다
   - 실제 요금은 무료 사용량 초과 시에만 부과됩니다

> 💡 **참고**: Naver Maps API는 월 10만 건까지 무료로 제공됩니다. (2026년 1월 기준)

---

## 📋 2단계: Application 등록

### 2-1. AI·NAVER API 서비스 이용 신청

1. [Naver Cloud Platform Console](https://console.ncloud.com/) 접속
2. 상단 메뉴에서 **Services > AI·NAVER API** 선택
3. 좌측 사이드바에서 **Application** 메뉴 클릭
4. **Application 등록** 버튼 클릭

### 2-2. Application 정보 입력

다음 정보를 입력합니다:

- **Application 이름**: `Kidsroad` (또는 원하는 이름)
- **서비스 선택**:
  - **Maps**를 펼쳐서 확인
  - ✅ **Web Dynamic Map** 선택 (필수)
  - 다른 서비스는 선택하지 않아도 됩니다

### 2-3. 서비스 환경 등록

**Web 서비스 URL** 섹션에 다음 URL들을 등록합니다:

#### 개발 환경

```
http://localhost:3000
```

#### 프로덕션 환경

```
https://kidsroad.vercel.app
```

> ⚠️ **중요**: URL은 정확히 입력해야 하며, 끝에 슬래시(`/`)를 붙이지 않습니다.

### 2-4. 등록 완료

**등록** 버튼을 클릭하여 Application 생성을 완료합니다.

---

## 📋 3단계: Client ID 발급 및 확인

### 3-1. Client ID 확인

1. Application 등록이 완료되면 **인증 정보** 탭으로 이동합니다
2. **Client ID** 값을 확인합니다
   - 형식: 영문자와 숫자로 구성된 문자열
   - 예시: `abc123def456ghi789`

> 💡 **Client ID는 공개되어도 무방합니다** (프론트엔드에서 사용됨)

### 3-2. Client ID 복사

**복사** 버튼을 클릭하여 Client ID를 클립보드에 복사해둡니다.

---

## 📋 4단계: 환경 변수 설정

### 4-1. .env.local 파일 수정

프로젝트 루트 디렉토리의 `.env.local` 파일을 열어 다음 환경 변수를 추가합니다:

```bash
# Naver Map API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=여기에_발급받은_Client_ID_붙여넣기
```

#### 예시

```bash
# Naver Map API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=abc123def456ghi789
```

> ⚠️ **주의**:
> - 환경 변수명은 정확히 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`이어야 합니다
> - `NEXT_PUBLIC_` 접두사가 있어야 클라이언트 사이드에서 접근 가능합니다
> - 따옴표 없이 값만 입력합니다

### 4-2. 개발 서버 재시작

환경 변수를 추가했다면 개발 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료 (Ctrl + C)
# 서버 재시작
npm run dev
```

---

## ✅ 5단계: 동작 확인

### 5-1. 지도 기능 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 메인 페이지 하단의 **지도 보기** 버튼 클릭
3. 지도가 정상적으로 로드되고 이벤트 마커들이 표시되는지 확인

### 5-2. 정상 동작 확인 항목

- ✅ 지도가 화면에 표시됨
- ✅ 이벤트 위치에 마커가 표시됨
- ✅ 마커 클릭 시 이벤트 정보(제목, 주소)가 표시됨
- ✅ 지도 이동/줌 인/줌 아웃이 정상 작동
- ✅ "이 지역에서 검색" 버튼이 표시됨

### 5-3. 브라우저 콘솔 확인

**개발자 도구(F12) > Console**에서 다음을 확인합니다:

- ❌ `Naver Maps API authentication failed` 에러가 없어야 함
- ❌ `Invalid Client ID` 에러가 없어야 함
- ✅ 지도 관련 경고 없이 정상 로드

---

## ✅ 완료 체크리스트

설정을 완료했다면 다음 항목들을 확인하세요:

- [ ] Naver Cloud Platform 계정 생성 완료
- [ ] 결제 수단 등록 완료 (무료 플랜 사용 가능)
- [ ] Application 등록 완료 (Web Dynamic Map 선택)
- [ ] Web 서비스 URL 등록 완료 (`localhost:3000`, `kidsroad.vercel.app`)
- [ ] Client ID 발급 및 복사 완료
- [ ] `.env.local`에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가 완료
- [ ] 개발 서버 재시작 완료
- [ ] 지도가 정상적으로 표시되는지 확인 완료

---

## 📌 현재 구현 완료 기능

Naver Map API 연동을 통해 다음 기능들이 이미 구현되어 있습니다:

1. ✅ **지도 뷰 전환**: 리스트 ↔ 지도 토글 버튼
2. ✅ **이벤트 마커 표시**: 각 행사의 위치에 마커 렌더링
3. ✅ **마커 클릭 인터랙션**: 제목, 주소 표시 및 DetailPanel 연동
4. ✅ **지도 영역 필터링**: 현재 화면에 보이는 이벤트만 필터링
5. ✅ **자동 중심/줌 조정**: 모든 마커가 보이도록 자동 조정

---

## 🔧 트러블슈팅

### 문제: 지도가 표시되지 않음

**증상**: 지도 영역이 빈 화면으로 표시됨

**해결**:

1. **Client ID 확인**
   - `.env.local` 파일의 Client ID가 정확한지 확인
   - Naver Cloud Console에서 복사한 값과 일치하는지 확인

2. **서버 재시작 확인**
   - 환경 변수 추가 후 개발 서버를 재시작했는지 확인
   - `npm run dev` 명령어로 서버 재시작

3. **브라우저 캐시 삭제**
   - 하드 새로고침: `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)

### 문제: "Authentication failed" 에러

**증상**: 콘솔에 인증 실패 에러 표시

**해결**:

1. **서비스 URL 확인**
   - Naver Cloud Console > Application > 서비스 환경
   - `http://localhost:3000` 또는 `https://kidsroad.vercel.app`이 정확히 등록되어 있는지 확인
   - URL 끝에 슬래시(`/`)가 없어야 함

2. **Web Dynamic Map 서비스 활성화 확인**
   - Application 설정에서 **Web Dynamic Map**이 선택되어 있는지 확인

### 문제: 마커가 표시되지 않음

**증상**: 지도는 보이지만 이벤트 마커가 없음

**해결**:

1. **이벤트 데이터 확인**
   - DB에 좌표 정보(`mapx`, `mapy`)가 있는 이벤트가 있는지 확인
   - 리스트 뷰에서 이벤트가 정상 표시되는지 확인

2. **콘솔 에러 확인**
   - 브라우저 개발자 도구(F12)에서 JavaScript 에러가 있는지 확인

### 문제: Vercel 배포 후 지도가 작동하지 않음

**증상**: 로컬에서는 정상이지만 프로덕션에서 지도가 표시되지 않음

**해결**:

1. **Vercel 환경 변수 설정**
   - Vercel Dashboard > Settings > Environment Variables
   - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가
   - 모든 환경(Production, Preview, Development)에 체크

2. **서비스 URL 재확인**
   - Naver Cloud Console에서 `https://kidsroad.vercel.app` URL이 등록되어 있는지 확인
   - 도메인이 정확한지 확인 (www 유무, 철자 등)

3. **재배포**
   - 환경 변수 추가 후 Vercel에서 재배포 (Redeploy) 실행

### 문제: 무료 사용량 초과 우려

**증상**: API 호출량이 걱정됨

**해결**:

- **무료 한도**: 월 10만 건 (2026년 1월 기준)
- **예상 사용량**:
  - 사용자 1명당 지도 로드 1회 + 이동 시 몇 회 추가
  - 월 1,000명 방문 시 약 3,000~5,000건 (충분히 무료 범위 내)
- **사용량 모니터링**: Naver Cloud Console > AI·NAVER API > 사용량 통계

---

## 📚 참고 문서

- [Naver Cloud Platform 콘솔](https://console.ncloud.com/)
- [Naver Maps API v3 문서](https://navermaps.github.io/maps.js.ncp/)
- [Naver Maps API 가이드](https://guide.ncloud-docs.com/docs/naveropenapiv3-maps-overview)
- [AI·NAVER API 이용 가이드](https://guide.ncloud-docs.com/docs/naveropenapiv3-use)
- [요금 안내](https://www.ncloud.com/product/aiService/maps)

---

## 💡 추가 팁

### 개발자 도구 활용

지도 디버깅 시 유용한 브라우저 개발자 도구 기능:

```javascript
// 콘솔에서 현재 지도 인스턴스 확인
console.log(window.naver);

// 현재 지도 중심 좌표 확인
// (NaverMap 컴포넌트에서 사용)
```

### 지도 커스터마이징

향후 지도 스타일이나 기능을 추가하고 싶다면:

- `components/NaverMap.tsx` 파일 수정
- [Naver Maps API 예제](https://navermaps.github.io/maps.js.ncp/docs/tutorial-digest.example.html) 참고

### 성능 최적화

- 마커가 많을 경우 클러스터링 라이브러리 고려
- 현재 구현된 영역 필터링으로 대부분의 경우 충분함
