# 한국관광공사 TourAPI 4.0 분석 정리

> **문서 버전:** v4.3 (2025년 11월 기준)  
> **분석 목적:** Kidsroad 프로젝트의 축제/행사 데이터 수집을 위한 API 활용

---

## 📌 핵심 요약

### 서비스 개요
- **제공 기관:** 한국관광공사
- **서비스명:** TourAPI 4.0 (국문 관광정보 서비스)
- **서비스 ID:** `KorService2`
- **베이스 URL:** `http://apis.data.go.kr/B551011/KorService2/`

### 트래픽 제한
- **개발 계정:** 일 1,000건
- **승인 방식:** 자동 승인 (신청 후 약 10분 소요)
- **연동:** 공공데이터포털

---

## 🔑 인증 및 호출 방법

### 1. API 키 발급
1. 공공데이터포털(data.go.kr) 접속
2. TourAPI 서비스 신청
3. 서비스 키 발급 (자동 승인)

### 2. 서비스 키 인코딩
```java
String myKey = "발급받은 인증키";
String serviceKey = URLEncoder.encode(myKey, "UTF-8");
```
**중요:** 모든 Character Set은 UTF-8

### 3. 기본 요청 형식
```
http://apis.data.go.kr/B551011/KorService2/{오퍼레이션명}?serviceKey={키}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TestApp
```

### 4. 응답 포맷
- **기본:** XML
- **JSON 요청:** URL에 `&_type=json` 추가

**JSON 요청 예시:**
```
http://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=serviceKey&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json
```

---

## 📋 주요 오퍼레이션 (Kidsroad 프로젝트 관련)

### 1. 지역코드 조회 (`areaCode2`)
**URL:** `/areaCode2`  
**용도:** 지역별 필터링에 필요한 지역 코드 조회  
**중요:** 25년 12월 말까지 사용 가능 → 이후 법정동 코드로 대체 예정

**필수 파라미터:**
| 파라미터 | 필수 | 설명 | 예시 |
|---------|------|------|------|
| MobileOS | O | OS 구분 | ETC, IOS, AND, WEB |
| MobileApp | O | 서비스명 | Kidsroad |
| serviceKey | O | 인증키 | (발급받은 키) |

**선택 파라미터:**
| 파라미터 | 설명 | 예시 |
|---------|------|------|
| numOfRows | 한 페이지 결과 수 | 10 |
| pageNo | 페이지 번호 | 1 |
| areaCode | 지역 코드 | 1 (서울) |

### 2. 서비스 분류코드 조회 (`categoryCode2`)
**URL:** `/categoryCode2`  
**용도:** 관광 타입별 분류 코드 (축제, 공연, 전시 등)

**필수 파라미터:** 동일 (MobileOS, MobileApp, serviceKey)

### 3. 지역기반 관광정보 조회 (`areaBasedList2`)
**URL:** `/areaBasedList2`  
**용도:** 특정 지역의 관광 정보 목록 조회

**주요 파라미터:**
| 파라미터 | 설명 | 예시 |
|---------|------|------|
| areaCode | 지역 코드 | 1 (서울) |
| sigunguCode | 시군구 코드 | 1 (강남구) |
| contentTypeId | 콘텐츠 타입 | 15 (행사/공연/축제) |

### 4. 키워드 검색 조회 (`searchKeyword2`)
**URL:** `/searchKeyword2`  
**용도:** 키워드로 관광 정보 검색

**주요 파라미터:**
| 파라미터 | 필수 | 설명 | 예시 |
|---------|------|------|------|
| keyword | O | 검색 키워드 | 축제 |
| contentTypeId | X | 콘텐츠 타입 | 15 |
| areaCode | X | 지역 코드 | 1 |

### 5. 행사정보 조회 (`searchFestival2`)
**URL:** `/searchFestival2`  
**용도:** 축제 및 행사 정보 조회 (⭐ Kidsroad 핵심 API)

**주요 파라미터:**
| 파라미터 | 설명 | 예시 |
|---------|------|------|
| eventStartDate | 행사 시작일 | 20250101 |
| eventEndDate | 행사 종료일 | 20251231 |
| areaCode | 지역 코드 | 1 |

### 6. 공통정보 조회 (`detailCommon2`)
**URL:** `/detailCommon2`  
**용도:** 관광 콘텐츠의 기본 정보 조회

**필수 파라미터:**
| 파라미터 | 설명 |
|---------|------|
| contentId | 콘텐츠 ID |

### 7. 소개정보 조회 (`detailIntro2`)
**URL:** `/detailIntro2`  
**용도:** 관광 콘텐츠의 상세 소개 정보

**필수 파라미터:**
| 파라미터 | 설명 |
|---------|------|
| contentId | 콘텐츠 ID |
| contentTypeId | 콘텐츠 타입 ID |

### 8. 이미지정보 조회 (`detailImage2`)
**URL:** `/detailImage2`  
**용도:** 콘텐츠의 이미지 목록 조회

**필수 파라미터:**
| 파라미터 | 설명 |
|---------|------|
| contentId | 콘텐츠 ID |

---

## 🏷️ 콘텐츠 타입 코드

| 타입 | ContentTypeId | 비고 |
|------|---------------|------|
| 관광지 | 12 | |
| 문화시설 | 14 | |
| **행사/공연/축제** | **15** | ⭐ Kidsroad 핵심 |
| 여행코스 | 25 | |
| 레포츠 | 28 | |
| 숙박 | 32 | |
| 쇼핑 | 38 | |
| 음식점 | 39 | |

---

## 🗺️ 지역 코드 (주요)

| 지역명 | areaCode | 비고 |
|--------|----------|------|
| 서울 | 1 | |
| 인천 | 2 | |
| 대전 | 3 | |
| 대구 | 4 | |
| 광주 | 5 | |
| 부산 | 6 | |
| 울산 | 7 | |
| 세종 | 8 | |
| 경기도 | 31 | |
| 강원도 | 32 | |
| 충청북도 | 33 | |
| 충청남도 | 34 | |
| 경상북도 | 35 | |
| 경상남도 | 36 | |
| 전라북도 | 37 | |
| 전라남도 | 38 | |
| 제주도 | 39 | |

**중요:** 시군구 코드는 `areaCode2` API로 상세 조회 필요

---

## ⚠️ 에러 코드

### 공공데이터포털 에러 코드
| 코드 | 메시지 | 설명 |
|------|--------|------|
| 01 | APPLICATION_ERROR | 어플리케이션 에러 |
| 04 | HTTP_ERROR | HTTP 에러 |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 오픈API 서비스 없음 |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근 거부 |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스 키 |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한 만료 |
| 32 | OUT_OF_SERVICE_ERROR | 서비스 제공 안함 |

### 제공기관 에러 코드
| 코드 | 메시지 | 설명 |
|------|--------|------|
| 00 | NORMAL_CODE | 정상 |
| 01 | APPLICATION_ERROR | 어플리케이션 에러 |
| 02 | DB_ERROR | 데이터베이스 에러 |
| 03 | NODATA_ERROR | 데이터 없음 |
| 04 | HTTP_ERROR | HTTP 에러 |
| 05 | SERVICETIME_OUT | 서비스 연결 실패 |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 잘못된 요청 파라미터 |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터 누락 |
| 12 | NO_OPENAPI_SERVICE_ERROR | 해당 오픈API 서비스 없음 |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근 거부 |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수 초과 |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스 키 |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 활용 기간 만료 |
| 99 | UNKNOWN_ERROR | 기타 에러 |

---

## 🎯 Kidsroad 프로젝트 활용 전략

### Phase 1: MVP 데이터 수집
1. **행사정보 조회 API (`searchFestival2`)** 활용
   - 전국 축제/행사 데이터 수집
   - 기간별 필터링 (eventStartDate, eventEndDate)
   - 지역별 필터링 (areaCode)

2. **공통정보 조회 API (`detailCommon2`)** 활용
   - 기본 정보 (제목, 주소, 연락처 등)
   - 운영 시간, 이용 요금 등

3. **이미지정보 조회 API (`detailImage2`)** 활용
   - 대표 이미지 및 추가 이미지

### 데이터 수집 주기
- **초기:** 전체 데이터 수집 (행사 1년치)
- **정기:** 매일 새벽 3시 크론잡으로 신규/변경 데이터 수집

### 저장할 핵심 데이터
```typescript
interface FestivalData {
  // 기본 정보
  contentId: string;
  contentTypeId: string;
  title: string;
  addr1: string;  // 주소
  addr2: string;  // 상세주소
  mapx: string;   // GPS X좌표
  mapy: string;   // GPS Y좌표
  tel: string;    // 연락처
  
  // 행사 정보
  eventStartDate: string;
  eventEndDate: string;
  
  // 이미지
  firstImage: string;
  firstImage2: string;
  
  // 지역 정보
  areaCode: string;
  sigunguCode: string;
  
  // Kidsroad 추가 필드
  ageGroup: string[];      // 연령대 (0-2, 3-5, 6-9, 10+)
  isIndoor: boolean;       // 실내/실외
  hasParking: boolean;     // 주차 가능 여부
  isStrollerFriendly: boolean;  // 유모차 가능 여부
  isFree: boolean;         // 무료 여부
}
```

### API 호출 순서
```
1. searchFestival2 (행사 목록)
   ↓
2. detailCommon2 (상세 정보)
   ↓
3. detailImage2 (이미지)
   ↓
4. Supabase에 저장
```

---

## 📝 주의사항

### 1. Rate Limiting
- 개발 계정: 일 1,000건
- 프로덕션 전환 시 계정 업그레이드 필요

### 2. 지역코드 변경 예정
- 현재 `areaCode2` API는 25년 12월 말까지만 사용 가능
- 이후 `법정동 코드` API로 전환 필요
- 프로젝트 로드맵에 마이그레이션 일정 반영 필요

### 3. 데이터 품질
- 공공데이터 특성상 필드 누락 가능
- 정제 로직 필수 (null 체크, 기본값 설정)
- 이미지 없는 경우 기본 이미지 대체

### 4. 캐싱 전략
- 데이터 변경이 잦지 않으므로 캐싱 적극 활용
- Supabase에 저장 후 API 호출 최소화

---

## 🔗 참고 링크

- **공공데이터포털:** https://data.go.kr
- **TourAPI 신청 페이지:** https://api.visitkorea.or.kr
- **API 문서 (공식):** https://api.visitkorea.or.kr/openapi

---

## 다음 단계

1. ✅ TourAPI 매뉴얼 분석 완료
2. ⬜ 공공데이터포털에서 API 키 발급
3. ⬜ Supabase DB 테이블 설계
4. ⬜ API 연동 코드 작성 (Next.js API Routes)
5. ⬜ 크론잡 설정 (Vercel Cron)
6. ⬜ 데이터 정제 로직 구현

---

**작성일:** 2026년 1월 6일  
**작성자:** Jay  
**프로젝트:** Kidsroad