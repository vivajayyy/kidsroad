# TourAPI 활용 가이드 (국문 관광정보)

> **한국관광공사 TourAPI 4.3 기반**
> Kidsroad의 핵심 데이터 소스인 TourAPI의 구조와 활용 방법을 정의합니다.

---

## 1. 개요

TourAPI는 한국관광공사의 공공데이터 오픈 API로, Kidsroad는 이를 통해 전국 축제 및 행사 데이터를 수집합니다.

- **발급처**: [공공데이터포털 (data.go.kr)](https://www.data.go.kr)
- **제공 기관**: 한국관광공사
- **데이터 형식**: JSON (응답 파라미터 `_type=json` 필수)
- **문서 참조**: `docs/api/한국관광공사_TourAPI활용매뉴얼(국문)_v4.3.docx`

---

## 2. API 엔드포인트 및 호출 규칙

### 2.1 베이스 URL
`http://apis.data.go.kr/B551011/KorService1/`

### 2.2 공통 파라미터 ( 필수 )

| 파라미터 | 값 | 설명 |
| :--- | :--- | :--- |
| `serviceKey` | 발급받은 인증키 | 공공데이터포털에서 발급받은 인코딩된 키 |
| `MobileOS` | `ETC` | 서비스 환경 (IOS, AND, WIN, ETC) |
| `MobileApp` | `kidsroad` | 서비스 이름 |
| `_type` | `json` | 응답 형식 (JSON) |

---

## 3. 주요 활용 API

Kidsroad에서 사용하는 핵심 API 목록입니다.

### 3.1 행사 정보 조회 (`searchFestival1`)
특정 날짜 범위를 기준으로 축제/행사 목록을 가져옵니다.

- **파라미터**:
  - `eventStartDate`: 시작일 (YYYYMMDD)
  - `areaCode`: 지역코드 (선택)
- **Kidsroad 활용**: 신규 데이터 수집 시 현재 날짜 이후의 행사를 검색하는 용도

### 3.2 위치 기반 관광정보 조회 (`locationBasedList1`)
사용자의 현재 위치(좌표)를 기준으로 주변 행사를 불러옵니다.

- **파라미터**:
  - `mapX`, `mapY`: 경도, 위도
  - `radius`: 거리 반경 (단위: m)
- **Kidsroad 활용**: "내 주변 아이와 갈만한 곳" 기능의 핵심

### 3.3 상세 정보 조회 (상세 페이지 구성)
목록 조회에서 얻은 `contentid`를 사용하여 상세 정보를 가져옵니다.

1.  **공통 정보 (`detailCommon1`)**: 주소, 좌표, 개요, 홈페이지 등
2.  **소개 정보 (`detailIntro1`)**: 행사 시간, 이용 요금, 주차 시설 등 (가장 중요)
3.  **반복 정보 (`detailInfo1`)**: 행사 프로그램, 부대 행사 등
4.  **이미지 정보 (`detailImage1`)**: 추가 사진 목록

---

## 4. Kidsroad 데이터 매핑 가이드

TourAPI 데이터를 우리 서비스의 `events` 테이블 필드로 변환하는 규칙입니다.

### 4.1 기본 정보 매핑

| TourAPI 필드 | `events` 테이블 필드 | 매핑 전략 |
| :--- | :--- | :--- |
| `contentid` | `contentid` | 고유 ID (PK 대용) |
| `title` | `title` | 행사 명칭 |
| `addr1` | `addr1` | 도로명/지번 주소 |
| `mapx` / `mapy` | `mapx` / `mapy` | 경도 / 위도 (Decimal) |
| `firstimage` | `firstimage` | 대표 이미지 URL |
| `eventstartdate` | `eventstartdate` | 시작일 (YYYY-MM-DD 변환) |
| `eventenddate` | `eventenddate` | 종료일 (YYYY-MM-DD 변환) |

### 4.2 부모 체크리스트 (로직 정제 필요)

TourAPI의 `detailIntro1` 응답에서 다음 키워드를 분석하여 저장합니다.

| Kidsroad 필드 | 분석 소스 (TourAPI) | 판단 로직 (예시) |
| :--- | :--- | :--- |
| `is_free` | `usetimefestival` | "무료" 단어 포함 여부 |
| `has_parking` | `parking` | "있음", "가능" 단어 포함 여부 |
| `has_stroller_access` | `wheelchair` / `info` | 유모차 대여/반입 가능 정보 필터링 |
| `is_indoor` | `title` / `info` | 장소 명칭에 박물관, 미술관 등 포함 시 실내 |

---

## 5. 콘텐츠 타입 및 지역 코드 (Reference)

### 5.1 콘텐츠 타입 ID (`contentTypeId`)
- **축제공연행사**: `15` (Kidsroad 주력 데이터)
- **문화시설**: `14` (박물관, 미술관 등)
- **관광지**: `12` (공원, 숲체험 등)

### 5.2 지역 코드 (`areaCode`)
- 서울(1), 인천(2), 대전(3), 대구(4), 광주(5), 부산(6), 울산(7), 세종(8), 경기(31), 강원(32) 등

---

## 6. 주의 사항

1.  **데이터 동기화**: `modifiedtime` 필드를 체크하여 기존 데이터가 업데이트되었는지 확인해야 합니다.
2.  **이미지 저작권**: TourAPI에서 제공하는 이미지 중 `Copyright` 필드가 포털/공사인 경우만 사용 가능합니다. (Open API 라이선스 준수 필수)
3.  **에러 핸들링**: API 호출 횟수 제한(QUOTA_EXCEEDED) 및 데이터 없음(NO_DATA) 상태에 대한 예외 처리가 필요합니다.
