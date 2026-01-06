# TourAPI 데이터 커버리지 분석 및 구현 전략

> **작성일**: 2026-01-07
> **목적**: TourAPI 데이터 분석 및 블로그 크롤링 + AI 분석 통합 전략 수립
> **버전**: v1.0 (사용자 피드백 반영 수정)

---

## 📊 분석 요약

TourAPI는 Kidsroad가 필요로 하는 **34개 필드 중 약 16개(47%)**를 직접 제공합니다.
나머지 18개 필드는 **추론 로직, 규칙 기반 분류, 키워드 분석**을 통해 보완해야 합니다.

### 🔴 핵심 결론 (사용자 피드백 반영)

> **"부모 체크리스트 정보(유모차, 수유실 등)가 Kidsroad의 핵심 차별점"**
>
> - 행사 정보만 제공하면 네이버 검색과 차별점 없음
> - 유모차/수유실 정보 없으면 재방문율 저하 → 서비스 실패
> - **초기 데이터 신뢰성 확보가 최우선**

**해결책**: **블로그 크롤링 + AI 분석을 MVP(Phase 1)에 통합** ✅

---

## 1. TourAPI 제공 데이터 vs Kidsroad 요구사항 매핑

### ✅ 직접 매핑 가능 (16개 필드)

TourAPI에서 **그대로 가져올 수 있는 필드**:

| Kidsroad 필드 | TourAPI 소스 | API 엔드포인트 | 신뢰도 |
|--------------|-------------|--------------|-------|
| contentid | contentid | searchFestival1 | ⭐⭐⭐⭐⭐ |
| title | title | searchFestival1 | ⭐⭐⭐⭐⭐ |
| addr1 | addr1 | searchFestival1 | ⭐⭐⭐⭐⭐ |
| addr2 | addr2 | searchFestival1 | ⭐⭐⭐⭐ |
| mapx | mapx | searchFestival1 | ⭐⭐⭐⭐⭐ |
| mapy | mapy | searchFestival1 | ⭐⭐⭐⭐⭐ |
| tel | tel | searchFestival1 | ⭐⭐⭐⭐ |
| firstimage | firstimage | searchFestival1 | ⭐⭐⭐⭐ |
| firstimage2 | firstimage2 | searchFestival1 | ⭐⭐⭐⭐ |
| eventstartdate | eventstartdate | searchFestival1 | ⭐⭐⭐⭐⭐ |
| eventenddate | eventenddate | searchFestival1 | ⭐⭐⭐⭐⭐ |
| eventplace | eventplace | detailIntro1 | ⭐⭐⭐⭐ |
| playtime | playtime | detailIntro1 | ⭐⭐⭐⭐ |
| usetimefestival | usetimefestival | detailIntro1 | ⭐⭐⭐⭐ |
| createdtime | createdtime | searchFestival1 | ⭐⭐⭐⭐⭐ |
| modifiedtime | modifiedtime | searchFestival1 | ⭐⭐⭐⭐⭐ |
| description | overview | detailCommon1 | ⭐⭐⭐⭐ |

**결론**: 기본 정보(위치, 날짜, 이미지, 연락처)는 TourAPI가 **완벽하게 제공**합니다.

---

### ⚠️ 부분적 제공 (4개 필드)

TourAPI에 **일부 있지만 완전하지 않은 필드**:

| Kidsroad 필드 | TourAPI 소스 | 제공 조건 | 신뢰도 | 보완 전략 |
|--------------|-------------|---------|-------|---------|
| category | contenttypeid | 모든 항목 | ⭐⭐⭐⭐ | 15=축제, 14=문화시설 등 매핑 |
| is_free | usetimefestival | 텍스트 분석 필요 | ⭐⭐⭐ | "무료", "0원" 키워드 검색 |
| has_parking | parkingculture | 문화시설만 (ContentType 14) | ⭐⭐ | **블로그 분석으로 보완** 🆕 |
| has_stroller_access | chkbabycarriageculture | 문화시설만 (ContentType 14) | ⭐⭐ | **블로그 분석으로 보완** 🆕 |

**문제점**:
- `has_parking`, `has_stroller_access`는 **문화시설(박물관, 미술관)에만 제공**
- **축제/공연 행사(ContentType 15)**는 이 정보가 **누락**되는 경우가 많음
- `is_free`는 텍스트 필드(`usetimefestival`)를 파싱해야 함

---

### ❌ 제공되지 않음 (10개 필드)

TourAPI에 **전혀 없는 필드** (추론 필수):

| Kidsroad 필드 | 추론 방법 | 데이터 소스 | 신뢰도 (규칙) | 신뢰도 (블로그 분석) |
|--------------|---------|-----------|--------------|------------------|
| age_ranges | 키워드 분석 | title + description | ⭐⭐⭐ | ⭐⭐⭐⭐ 🆕 |
| is_indoor | 키워드 분석 | title + eventplace | ⭐⭐⭐ | ⭐⭐⭐⭐ 🆕 |
| is_outdoor | 키워드 분석 | title + eventplace | ⭐⭐⭐ | ⭐⭐⭐⭐ 🆕 |
| has_nursing_room | 규칙 기반 | 문화시설만 | ⭐⭐ | ⭐⭐⭐⭐ 🆕 |
| has_diaper_station | 규칙 기반 | 문화시설만 | ⭐⭐ | ⭐⭐⭐⭐ 🆕 |
| tags | 키워드 추출 | title + description + category | ⭐⭐⭐ | ⭐⭐⭐⭐ 🆕 |

**핵심 문제**:
- **연령대 정보(age_ranges)**: TourAPI의 `agelimit` 필드는 "전체 관람가", "만 3세 이상" 등 **제한 사항**만 표시
- Kidsroad가 필요한 것은 **추천 연령대** (`['3-5', '6-9']`)이므로 **완전히 다른 개념**
- **실내/실외 구분**: API에 명시적 필드 없음
- **수유실/기저귀 교환대**: API에 없음 (문화시설 일부만 추론 가능)

---

## 2. 데이터 신뢰성 문제점

### 문제점 1: 불완전한 데이터

```
예시: 어린이 축제 정보
- TourAPI 제공: 제목, 날짜, 위치 ✅
- TourAPI 누락: 연령대, 유모차 가능 여부, 실내/실외 ❌
```

→ **부모가 가장 궁금해하는 정보가 누락됨**

### 문제점 2: 텍스트 필드의 비일관성

```
예시: usetimefestival 필드 값
- "무료" → is_free = true ✅
- "입장료 없음" → is_free = ??? (키워드 확장 필요)
- "기본 무료 / 일부 유료" → is_free = ??? (애매함)
- "" (빈 문자열) → is_free = ??? (정보 없음)
```

→ **규칙 기반 파싱의 정확도 한계**

### 문제점 3: ContentType에 따른 필드 차이

```
ContentType 15 (축제/행사):
  - parkingculture: ❌ 없음
  - chkbabycarriageculture: ❌ 없음

ContentType 14 (문화시설):
  - parkingculture: ✅ 있음
  - chkbabycarriageculture: ✅ 있음
```

→ **데이터 구조가 통일되지 않음**

---

## 3. 수정된 전략: 블로그 크롤링 + AI 분석 (MVP 통합) 🆕

### 3.1 전략 비교

**기존 계획 (문제)**:
```
Phase 1 (MVP): 규칙 기반 추정 (정확도 70%) → "정보 없음" 많음
Phase 2: 사용자 제보 → 너무 늦음, 이미 신뢰 상실
```

**수정된 계획 (해결)**:
```
Phase 1 (MVP): TourAPI + 네이버 블로그 크롤링 + Claude API 분석
  ↓
부모 체크리스트 정보 신뢰도 85-90% 확보
  ↓
사용자 만족 → 재방문율 향상 → 서비스 성공 ✅
```

### 3.2 블로그 크롤링 + AI 분석 프로세스

```
1. TourAPI에서 행사 기본 정보 수집
   ↓
2. 네이버 블로그 검색 API로 후기 검색
   (검색어: "{행사명} 후기 유모차 수유실 주차")
   ↓
3. 최근 6개월 이내 블로그 5-10개 선별
   ↓
4. Cheerio로 블로그 본문 크롤링
   ↓
5. Claude Haiku API로 텍스트 분석
   - 유모차 접근성
   - 수유실 유무
   - 주차 가능 여부
   - 기저귀 교환대 유무
   - 연령대 추천
   ↓
6. TourAPI + AI 분석 결과 통합
   ↓
7. 신뢰도 점수 계산 (여러 블로그 일치도)
   ↓
8. Supabase DB 저장
```

### 3.3 예상 비용

```
초기 데이터 수집 (500개 행사):
- 네이버 블로그 검색 API: 무료 (일 25,000건 제한)
- 블로그 크롤링: 무료 (서버 리소스만)
- Claude Haiku API:
  * 행사당 평균 5개 블로그 × 1,000토큰 = 5,000토큰
  * 500개 행사 = 2,500,000토큰
  * Haiku: $0.80/1M 토큰 (입력) + $4.00/1M 토큰 (출력)
  * 입력 비용: 2.5M × $0.80 = $2.00
  * 출력 비용: 0.5M × $4.00 = $2.00
  * 총 비용: $4.00 (약 5,000원)

월간 유지비용 (신규/변경 행사 50개):
- $0.40/월 (약 500원)
```

**→ 초기 5,000원, 월간 500원으로 핵심 차별점 확보!** 🎯

### 3.4 비용 최적화 전략

1. **캐싱**: 한 번 분석한 행사는 1개월간 재분석 안 함
2. **배치 처리**: 여러 행사 동시 분석
3. **Haiku 모델 사용**: Sonnet보다 5배 저렴
4. **신뢰도 필터링**: 80점 이상 행사는 재분석 스킵

---

## 4. 신뢰도 레벨 표시 전략

데이터 출처에 따라 신뢰도를 구분:

| 레벨 | 데이터 출처 | UI 표시 | 예시 |
|-----|----------|--------|-----|
| **높음 ⭐⭐⭐⭐** | TourAPI 직접 제공 | "확인됨" | 날짜, 위치, 이미지 |
| **높음 ⭐⭐⭐⭐** | 블로그 분석 (신뢰도 85%+) | "블로그 후기 기반" | 유모차, 수유실, 주차 |
| **중간 ⭐⭐⭐** | 규칙 기반 추론 | "추정" | 실내/실외 (블로그 없을 시) |
| **낮음 ⭐** | 기본값 | "정보 없음" | 데이터 없음 |

**UI 예시**:
```
✅ 유모차 가능 (블로그 후기 5명 확인)
✅ 수유실 있음 (블로그 후기 3명 확인)
✅ 주차 가능 (확인됨)
🔍 실내 행사 (추정)
❓ 기저귀 교환대 (정보 없음)
```

---

## 5. 구현 파일 목록

### MVP (Week 2-3 구현)

```
lib/
  ├─ tour-api.ts           (TourAPI 연동)
  ├─ blog-crawler.ts       (네이버 블로그 크롤링) 🆕
  └─ ai-analyzer.ts        (Claude API 텍스트 분석) 🆕

utils/
  ├─ mapper.ts             (TourAPI → Supabase 변환)
  └─ data-enrichment.ts    (데이터 통합 로직) 🆕

scripts/
  └─ collect-and-enrich.ts (전체 파이프라인) 🆕

types/
  └─ enriched-event.ts     (타입 정의) 🆕
```

---

## 6. 수정된 로드맵

### Week 1: 환경 설정 ✅ (완료)
- Next.js + Supabase 셋업

### Week 2: DB 설계 + TourAPI 기본 연동 ✅ (완료)
- Events 테이블 생성
- TourAPI 타입 정의
- 기본 API 호출 테스트

### Week 3: 데이터 수집 파이프라인 (수정됨) ⭐⭐⭐
- **TourAPI 전체 연동** (`lib/tour-api.ts`)
- **네이버 블로그 크롤링** (`lib/blog-crawler.ts`)
- **Claude API 텍스트 분석** (`lib/ai-analyzer.ts`)
- **데이터 통합 로직** (`utils/data-enrichment.ts`)
- **수집 스크립트** (`scripts/collect-and-enrich.ts`)
- **500개 행사 데이터 수집 및 분석**

### Week 4: 메인 페이지 UI
- 행사 목록 조회 (`lib/events.ts`)
- EventCard 컴포넌트
- 신뢰도 표시 UI

### Week 5: 검색/필터 기능
- 연령/지역/체크리스트 필터
- 검색 결과 페이지

### Week 6: 상세 페이지
- 행사 상세 정보
- 지도 연동
- 관련 행사 추천

### Week 7: QA & 최적화
- 버그 수정
- 성능 최적화
- 데이터 품질 검증

### Week 8: 출시 준비
- SEO 최적화
- 베타 오픈
- 모니터링 설정

**→ 8주 로드맵 유지하면서 Week 3에 블로그 분석 통합**

---

## 7. 리스크 및 대응

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|-------|-------|----------|---------|
| AI 분석 정확도 낮음 (70% 이하) | 높음 | 낮음 | 프롬프트 엔지니어링, 여러 블로그 교차 검증 |
| 네이버 블로그 구조 변경 | 중간 | 중간 | Cheerio 셀렉터 유연하게 작성, 대안 크롤링 |
| API 비용 초과 | 낮음 | 낮음 | 캐싱 전략, 재분석 조건 설정 |
| 블로그 정보 부족 (지방 행사) | 중간 | 중간 | TourAPI 정보 우선 사용, 규칙 기반 보조 |
| 법적 이슈 (크롤링) | 중간 | 낮음 | 네이버 API 우선 사용, 저작권 준수 |

---

## 8. 최종 결론

### ❌ 기존 전략의 문제점

**TourAPI만 사용 시**:
- 부모 체크리스트 정보 누락 → 핵심 차별점 상실
- "정보 없음" 많음 → 사용자 실망 → 재방문율 저하

### ✅ 수정된 전략 (블로그 분석 통합)

**TourAPI + 블로그 크롤링 + AI 분석**:
- 부모 체크리스트 정보 신뢰도 **85-90% 달성**
- 초기 비용 **5,000원, 월간 500원**으로 매우 효율적
- **초기 신뢰 확보** → 재방문율 향상 → 서비스 성공

### 🎯 핵심 요약

1. MVP에서부터 **핵심 차별점(부모 체크리스트)을 강력하게** 제공
2. 사용자에게 **"블로그 후기 기반" 명시**로 투명성 확보
3. 8주 로드맵 유지하면서 Week 3에 집중 구현
4. **사용자 제안이 100% 타당합니다. 이 방향으로 진행합니다.** ✅

---

## 9. 참고 문서

- **TourAPI 활용 가이드**: `docs/TOUR_API_GUIDE.md`
- **데이터베이스 설계**: `docs/DATABASE.md`
- **PRD (제품 요구사항)**: `docs/PRD.md`
- **개발 로드맵**: `docs/ROADMAP.md`

---

**문서 끝**
