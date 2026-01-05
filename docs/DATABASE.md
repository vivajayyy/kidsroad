# Kidsroad 데이터베이스 설계 문서

> **작성일**: 2026-01-05
> **버전**: v1.0 (MVP)
> **데이터베이스**: PostgreSQL (Supabase)

---

## 목차

1. [개요](#개요)
2. [ERD (Entity Relationship Diagram)](#erd-entity-relationship-diagram)
3. [테이블 상세 설계](#테이블-상세-설계)
4. [인덱스 전략](#인덱스-전략)
5. [보안 정책 (RLS)](#보안-정책-rls)
6. [향후 확장 계획](#향후-확장-계획)

---

## 개요

### 설계 목표

- **MVP 단계**: 핵심 기능(행사 검색/필터)에 필요한 최소 테이블 구조
- **성능 최적화**: 전략적 인덱싱으로 빠른 검색 지원
- **확장 가능성**: Phase 2 기능(찜하기, 후기) 추가 시 최소 변경

### 주요 특징

- **TourAPI 완벽 매핑**: 한국관광공사 API 데이터 필드 전체 지원
- **Kidsroad 특화**: 연령별 필터, 부모 체크리스트 (유모차, 주차 등)
- **타입 안전성**: TypeScript 타입 자동 생성 (`supabase gen types`)
- **보안**: RLS(Row Level Security)로 접근 제어

---

## ERD (Entity Relationship Diagram)

### MVP 구조 (Week 2)

```
┌─────────────────────────────────────────────────────────────┐
│                         EVENTS                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id                    BIGSERIAL                         │
│ UK  contentid             VARCHAR(20)   (TourAPI ID)        │
│     title                 TEXT                              │
│     addr1, addr2          TEXT                              │
│     mapx, mapy            DECIMAL       (위도/경도)         │
│     tel                   VARCHAR(50)                       │
│     firstimage            TEXT          (대표 이미지)       │
│     firstimage2           TEXT          (썸네일)            │
│     eventstartdate        DATE                              │
│     eventenddate          DATE                              │
│     eventplace            TEXT          (행사장소)          │
│     playtime              TEXT          (공연시간)          │
│     usetimefestival       TEXT          (이용요금)          │
│     createdtime           TIMESTAMP     (TourAPI)           │
│     modifiedtime          TIMESTAMP     (TourAPI)           │
│     age_ranges            TEXT[]        ['0-2','3-5',...]   │
│     is_indoor             BOOLEAN                           │
│     is_outdoor            BOOLEAN                           │
│     has_stroller_access   BOOLEAN                           │
│     has_parking           BOOLEAN                           │
│     is_free               BOOLEAN                           │
│     has_nursing_room      BOOLEAN                           │
│     has_diaper_station    BOOLEAN                           │
│     category              VARCHAR(50)                       │
│     tags                  TEXT[]                            │
│     description           TEXT                              │
│     data_source           VARCHAR(50)   DEFAULT 'TourAPI'   │
│     is_published          BOOLEAN       DEFAULT true        │
│     created_at            TIMESTAMP     DEFAULT NOW()       │
│     updated_at            TIMESTAMP     DEFAULT NOW()       │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2 확장 구조 (Week 5 예정)

```
                    ┌──────────────┐
                    │  auth.users  │  (Supabase Auth)
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  PROFILES    │  │  BOOKMARKS   │  │   REVIEWS    │
  ├──────────────┤  ├──────────────┤  ├──────────────┤
  │ id (FK)      │  │ id           │  │ id           │
  │ display_name │  │ user_id (FK) │  │ user_id (FK) │
  │ favorite_    │  │ event_id (FK)│  │ event_id (FK)│
  │   age_ranges │  │ created_at   │  │ rating       │
  │ created_at   │  └──────┬───────┘  │ content      │
  └──────────────┘         │          │ created_at   │
                           │          └──────┬───────┘
                           │                 │
                           └─────────┬───────┘
                                     │
                                     ▼
                            ┌──────────────┐
                            │    EVENTS    │
                            │  (기존)      │
                            └──────────────┘
```

---

## 테이블 상세 설계

### EVENTS 테이블

#### 1. TourAPI 필드 (20개)

| 필드명          | 타입           | 제약조건     | 설명                          | TourAPI 필드      |
| --------------- | -------------- | ------------ | ----------------------------- | ----------------- |
| id              | BIGSERIAL      | PRIMARY KEY  | 내부 고유 ID                  | -                 |
| contentid       | VARCHAR(20)    | UNIQUE, NOT NULL | TourAPI 콘텐츠 ID (외부 참조) | contentid         |
| title           | TEXT           | NOT NULL     | 행사명                        | title             |
| addr1           | TEXT           | NULL         | 주소 (기본)                   | addr1             |
| addr2           | TEXT           | NULL         | 주소 (상세)                   | addr2             |
| mapx            | DECIMAL(11, 8) | NULL, CHECK  | 경도 (WGS84)                  | mapx              |
| mapy            | DECIMAL(10, 8) | NULL, CHECK  | 위도 (WGS84)                  | mapy              |
| tel             | VARCHAR(50)    | NULL         | 연락처                        | tel               |
| firstimage      | TEXT           | NULL         | 대표 이미지 URL               | firstimage        |
| firstimage2     | TEXT           | NULL         | 썸네일 이미지 URL             | firstimage2       |
| eventstartdate  | DATE           | NOT NULL, CHECK | 행사 시작일                   | eventstartdate    |
| eventenddate    | DATE           | NOT NULL, CHECK | 행사 종료일                   | eventenddate      |
| eventplace      | TEXT           | NULL         | 행사장소명                    | eventplace (intro)|
| playtime        | TEXT           | NULL         | 공연/행사 시간                | playtime (intro)  |
| usetimefestival | TEXT           | NULL         | 이용요금 정보                 | usetimefestival   |
| createdtime     | TIMESTAMP      | NULL         | TourAPI 데이터 생성 시각      | createdtime       |
| modifiedtime    | TIMESTAMP      | NULL         | TourAPI 데이터 수정 시각      | modifiedtime      |

**CHECK 제약조건:**
```sql
CHECK (eventstartdate <= eventenddate)
CHECK (mapx IS NULL OR (mapx >= -180 AND mapx <= 180))
CHECK (mapy IS NULL OR (mapy >= -90 AND mapy <= 90))
```

#### 2. Kidsroad 특화 필드 (9개)

| 필드명               | 타입        | 기본값  | 설명                                      |
| -------------------- | ----------- | ------- | ----------------------------------------- |
| age_ranges           | TEXT[]      | '{}'    | 적합 연령대 ['0-2', '3-5', '6-9', '10+']  |
| is_indoor            | BOOLEAN     | NULL    | 실내 여부 (null = 미확인)                 |
| is_outdoor           | BOOLEAN     | NULL    | 실외 여부 (null = 미확인)                 |
| has_stroller_access  | BOOLEAN     | false   | 유모차 접근 가능                          |
| has_parking          | BOOLEAN     | false   | 주차 가능                                 |
| is_free              | BOOLEAN     | false   | 무료 입장                                 |
| has_nursing_room     | BOOLEAN     | false   | 수유실 있음                               |
| has_diaper_station   | BOOLEAN     | false   | 기저귀 교환대 있음                        |
| category             | VARCHAR(50) | NULL    | 카테고리 ('축제', '전시', '공연', '체험') |
| tags                 | TEXT[]      | '{}'    | 태그 ['야외', '무료', '체험형']           |
| description          | TEXT        | NULL    | 행사 상세 설명                            |

**설계 근거:**
- `age_ranges`: 배열 타입으로 복수 선택 지원 (예: 3-5세와 6-9세 모두 적합)
- `is_indoor`/`is_outdoor`: 분리된 필드 (일부 행사는 실내+실외 혼합)
- 부모 체크리스트: 개별 BOOLEAN으로 인덱싱 효율 극대화

#### 3. 시스템 필드 (5개)

| 필드명       | 타입        | 기본값     | 설명                                   |
| ------------ | ----------- | ---------- | -------------------------------------- |
| data_source  | VARCHAR(50) | 'TourAPI'  | 데이터 출처 ('TourAPI', '문화포털' 등) |
| is_published | BOOLEAN     | true       | 공개 여부 (관리자 제어)                |
| created_at   | TIMESTAMP   | NOW()      | 레코드 생성 시각                       |
| updated_at   | TIMESTAMP   | NOW()      | 레코드 수정 시각 (트리거 자동 갱신)    |

**Auto-update Trigger:**
```sql
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 인덱스 전략

### 인덱스 목록 (7개)

| 인덱스명                 | 타입  | 필드                                 | 목적                   | Partial Index |
| ------------------------ | ----- | ------------------------------------ | ---------------------- | ------------- |
| idx_events_date_range    | BTREE | eventstartdate, eventenddate         | 날짜 범위 검색 (가장 빈번) | WHERE is_published = true |
| idx_events_location      | GIST  | ll_to_earth(mapy, mapx)              | 위치 기반 검색 (거리 계산) | WHERE mapx/mapy NOT NULL |
| idx_events_age_ranges    | GIN   | age_ranges                           | 연령 배열 검색 (@> 연산자) | WHERE is_published = true |
| idx_events_tags          | GIN   | tags                                 | 태그 배열 검색             | WHERE is_published = true |
| idx_events_fulltext      | GIN   | to_tsvector('simple', title + desc)  | 전문 검색 (제목+설명)      | -             |
| idx_events_category      | BTREE | category                             | 카테고리 필터              | WHERE is_published = true AND category IS NOT NULL |
| idx_events_checklist     | BTREE | is_free, has_parking, has_stroller_access | 체크리스트 조합 검색 | WHERE is_published = true |

### 인덱스 사용 예시

```sql
-- 날짜 범위 검색 (idx_events_date_range)
SELECT * FROM events
WHERE eventstartdate >= '2026-02-01'
  AND eventenddate <= '2026-02-28'
  AND is_published = true;

-- 연령 필터 (idx_events_age_ranges)
SELECT * FROM events
WHERE age_ranges @> ARRAY['3-5']
  AND is_published = true;

-- 위치 기반 검색 (idx_events_location)
SELECT *, earth_distance(
  ll_to_earth(37.5665, 126.9780),  -- 서울시청 좌표
  ll_to_earth(mapy, mapx)
) AS distance
FROM events
WHERE earth_box(ll_to_earth(37.5665, 126.9780), 10000) @> ll_to_earth(mapy, mapx)
ORDER BY distance;

-- 복합 필터 (idx_events_checklist)
SELECT * FROM events
WHERE is_free = true
  AND has_parking = true
  AND has_stroller_access = true
  AND is_published = true;
```

### 성능 고려사항

- **Partial Index**: `WHERE is_published = true` 조건으로 인덱스 크기 30-40% 감소
- **GIN Index**: 배열 필드(`age_ranges`, `tags`) 검색을 O(log N)으로 최적화
- **GIST Index**: earthdistance 확장으로 지리적 거리 계산 지원

---

## 보안 정책 (RLS)

### RLS 활성화

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

### 정책 목록

| 정책명                                 | 작업   | 대상                | 조건                   | 설명                       |
| -------------------------------------- | ------ | ------------------- | ---------------------- | -------------------------- |
| "Public events are viewable by everyone" | SELECT | anon, authenticated | is_published = true    | 공개된 행사는 모두 조회 가능 |
| "Service role has full access"         | ALL    | service_role        | true                   | 백엔드 스크립트용 전체 권한 |

### 추후 추가 예정 (Phase 2)

```sql
-- 관리자 정책 (예정)
CREATE POLICY "Admins can manage all events"
ON events FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 권한 매트릭스

| 역할           | SELECT | INSERT | UPDATE | DELETE | 비고                        |
| -------------- | ------ | ------ | ------ | ------ | --------------------------- |
| anon           | ✅ (공개만) | ❌      | ❌      | ❌      | 비로그인 사용자             |
| authenticated  | ✅ (공개만) | ❌      | ❌      | ❌      | 로그인 사용자 (동일)        |
| service_role   | ✅      | ✅      | ✅      | ✅      | 백엔드 데이터 수집 스크립트 |
| admin (예정)   | ✅      | ✅      | ✅      | ✅      | 관리자 (Phase 2)            |

---

## 향후 확장 계획

### Phase 2: 사용자 기능 (Week 5)

#### PROFILES 테이블

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  favorite_age_ranges TEXT[],  -- 관심 연령대
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### BOOKMARKS 테이블 (찜하기)

```sql
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_event ON bookmarks(event_id);
```

#### REVIEWS 테이블 (후기)

```sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  images TEXT[],  -- 후기 이미지 URL 배열
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### Phase 3: 고도화 (Week 8+)

- **EVENT_CATEGORIES**: 카테고리 정규화 (다대다 관계)
- **EVENT_VIEWS**: 조회수 추적
- **EVENT_RECOMMENDATIONS**: AI 추천 결과 캐싱

---

## 데이터 매핑 전략

### TourAPI → Supabase 변환

#### 직접 매핑

```typescript
{
  contentid: tourEvent.contentid,
  title: tourEvent.title,
  addr1: tourEvent.addr1,
  addr2: tourEvent.addr2,
  mapx: parseFloat(tourEvent.mapx),
  mapy: parseFloat(tourEvent.mapy),
  eventstartdate: formatDate(tourEvent.eventstartdate), // YYYYMMDD → YYYY-MM-DD
  eventenddate: formatDate(tourEvent.eventenddate),
  firstimage: tourEvent.firstimage,
  firstimage2: tourEvent.firstimage2,
  // ...
}
```

#### 추론 로직 (Week 3 구현 예정)

```typescript
// 연령 추론
function inferAgeRanges(title: string, description: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const ranges: string[] = [];

  if (/영아|0세|돌/.test(text)) ranges.push('0-2');
  if (/유아|유치원|어린이집/.test(text)) ranges.push('3-5');
  if (/초등|어린이/.test(text)) ranges.push('6-9');
  if (/청소년|중학생/.test(text)) ranges.push('10+');

  return ranges.length > 0 ? ranges : ['3-5', '6-9']; // 기본값
}

// 실내/실외 추론
function detectIndoor(title: string): boolean | null {
  if (/실내|전시관|박물관|미술관/.test(title)) return true;
  if (/야외|축제|공원|해변/.test(title)) return false;
  return null; // 미확인
}

// 무료 여부 추론
function detectFree(fee: string): boolean {
  return /무료|0원/.test(fee);
}
```

---

## 참고 자료

- **마이그레이션 파일**: `supabase/migrations/20260105_create_events_table.sql`
- **TypeScript 타입**: `types/supabase.ts` (자동 생성)
- **테스트 스크립트**: `scripts/test-db.ts`, `scripts/check-db.ts`
- **TourAPI 문서**: https://api.visitkorea.or.kr/
- **Supabase 문서**: https://supabase.com/docs

---

## 변경 이력

| 날짜       | 버전 | 변경 내용                          | 작성자 |
| ---------- | ---- | ---------------------------------- | ------ |
| 2026-01-05 | 1.0  | 초안 작성 (MVP events 테이블 설계) | AI     |

---

**문서 끝**
