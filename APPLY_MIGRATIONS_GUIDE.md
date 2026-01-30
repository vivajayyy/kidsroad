# 🔧 Supabase Migration 적용 가이드

## 📋 적용할 마이그레이션

1. **Security 이슈 수정**: `supabase/migrations/20260121_fix_security_issues.sql`
2. **Performance 최적화**: `supabase/migrations/20260121_optimize_rls_performance.sql`

## 🚀 적용 방법

### 방법 1: Supabase Dashboard (권장) ⭐

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard/project/pajxzcnddwnknhbddbws

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - 또는 직접 URL: https://supabase.com/dashboard/project/pajxzcnddwnknhbddbws/sql/new

3. **Security 수정 SQL 실행**
   - 아래 파일 내용을 복사하여 붙여넣기:
   - 파일: `supabase/migrations/20260121_fix_security_issues.sql`
   - `RUN` 버튼 클릭

4. **Performance 최적화 SQL 실행**
   - 새 Query 탭 열기
   - 아래 파일 내용을 복사하여 붙여넣기:
   - 파일: `supabase/migrations/20260121_optimize_rls_performance.sql`
   - `RUN` 버튼 클릭

5. **확인**
   - Dashboard → `Reports` → `Database Health` 에서 이슈 감소 확인

---

### 방법 2: Supabase CLI

```bash
# 1. 프로젝트 연결 확인
npx supabase link --project-ref pajxzcnddwnknhbddbws

# 2. 기존 마이그레이션 임시 이동
mkdir supabase/migrations/temp
move supabase/migrations/20260116_*.sql supabase/migrations/temp/

# 3. 새 마이그레이션만 적용
npx supabase db push

# 4. 기존 마이그레이션 복원
move supabase/migrations/temp/*.sql supabase/migrations/
rmdir supabase/migrations/temp
```

---

## 📊 예상 결과

### Before
- **SECURITY**: 5개 이슈
- **PERFORMANCE**: 4개 이슈

### After
- **SECURITY**: 1개 (Compromised Password 안내만 남음)
- **PERFORMANCE**: 0개

---

## 🔍 해결되는 이슈 상세

### SECURITY (5개)

1. ✅ Function `public.handle_new_user` search_path 보안 취약점
2. ✅ Function `public.update_updated_at_column` search_path 보안 취약점
3. ✅ Extension `cube` public 스키마 → extensions 스키마로 이동
4. ✅ Extension `earthdistance` public 스키마 → extensions 스키마로 이동
5. ℹ️ Compromised Password 체크 (기본 안내, 수정 불필요)

### PERFORMANCE (4개)

1. ✅ `public.profiles` RLS 정책 최적화
2. ✅ `public.bookmarks` SELECT 정책 최적화
3. ✅ `public.bookmarks` INSERT 정책 최적화
4. ✅ `public.bookmarks` DELETE 정책 최적화

---

## ⚠️ 주의사항

- 적용 전 현재 데이터베이스 상태를 백업하는 것을 권장합니다
- SQL 실행 시 에러가 발생하면 중단하고 에러 메시지를 확인하세요
- 프로덕션 환경에서는 반드시 테스트 후 적용하세요

---

## 🆘 문제 발생 시

1. **에러 메시지 확인**: SQL Editor에서 상세한 에러 메시지 확인
2. **롤백**: Supabase Dashboard → Database → Backups에서 복원
3. **로그 확인**: Dashboard → Logs에서 상세 로그 확인
