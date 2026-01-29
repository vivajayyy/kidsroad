/**
 * 부적합한 행사 정리 스크립트
 * 제외 키워드가 포함된 기존 이벤트를 찾아서 삭제
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { EXCLUDE_KEYWORDS, isExcludedEvent } from '../lib/kid-friendly-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

interface CleanupResult {
  total: number;
  excluded: Array<{
    contentid: string;
    title: string;
    matchedKeyword: string;
  }>;
}

async function findExcludedEvents(): Promise<CleanupResult> {
  console.log('🔍 부적합한 행사 검색 중...\n');
  console.log(`제외 키워드: ${EXCLUDE_KEYWORDS.join(', ')}\n`);

  const { data: events, error } = await supabase
    .from('events')
    .select('contentid, title, description')
    .order('title');

  if (error) {
    throw new Error(`DB 조회 실패: ${error.message}`);
  }

  if (!events || events.length === 0) {
    console.log('저장된 이벤트가 없습니다.');
    return { total: 0, excluded: [] };
  }

  console.log(`📋 총 ${events.length}개 이벤트 검사 중...\n`);

  const excluded: CleanupResult['excluded'] = [];

  for (const event of events) {
    const text = `${event.title} ${event.description || ''}`;

    for (const keyword of EXCLUDE_KEYWORDS) {
      if (text.includes(keyword)) {
        excluded.push({
          contentid: event.contentid,
          title: event.title,
          matchedKeyword: keyword,
        });
        break; // 첫 번째 매칭 키워드만 기록
      }
    }
  }

  return { total: events.length, excluded };
}

async function deleteExcludedEvents(contentIds: string[]): Promise<number> {
  if (contentIds.length === 0) return 0;

  const { error, count } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .in('contentid', contentIds);

  if (error) {
    throw new Error(`삭제 실패: ${error.message}`);
  }

  return count || 0;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--delete');

  console.log('='.repeat(60));
  console.log('🧹 부적합한 행사 정리 스크립트');
  console.log(`모드: ${isDryRun ? '🔍 조회만 (dry-run)' : '🗑️ 실제 삭제'}`);
  console.log('='.repeat(60));
  console.log();

  try {
    const result = await findExcludedEvents();

    if (result.excluded.length === 0) {
      console.log('✅ 부적합한 행사가 없습니다!');
      return;
    }

    console.log(`\n❌ 부적합한 행사 ${result.excluded.length}개 발견:\n`);

    for (const event of result.excluded) {
      console.log(`  - [${event.matchedKeyword}] ${event.title}`);
    }

    console.log(`\n📊 요약: ${result.total}개 중 ${result.excluded.length}개 부적합 (${((result.excluded.length / result.total) * 100).toFixed(1)}%)`);

    if (isDryRun) {
      console.log('\n💡 실제로 삭제하려면 --delete 옵션을 추가하세요:');
      console.log('   npx tsx scripts/cleanup-events.ts --delete');
    } else {
      console.log('\n🗑️ 삭제 진행 중...');
      const deletedCount = await deleteExcludedEvents(
        result.excluded.map(e => e.contentid)
      );
      console.log(`✅ ${deletedCount}개 이벤트 삭제 완료!`);
    }

  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

main();
