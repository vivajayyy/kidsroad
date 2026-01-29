/**
 * 이벤트 상세 검토 스크립트
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { EXCLUDE_KEYWORDS } from '../lib/kid-friendly-filter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  const { data: events, error } = await supabase
    .from('events')
    .select('contentid, title, description, age_ranges')
    .order('title');

  if (error || !events) {
    console.error('DB 조회 실패:', error);
    return;
  }

  console.log(`\n📋 전체 ${events.length}개 이벤트 상세 검토\n`);
  console.log('='.repeat(80));

  for (const event of events) {
    const text = `${event.title} ${event.description || ''}`;
    let matchedKeyword = null;

    for (const keyword of EXCLUDE_KEYWORDS) {
      if (text.includes(keyword)) {
        matchedKeyword = keyword;
        break;
      }
    }

    // 매칭된 키워드가 있는 경우만 상세 출력
    if (matchedKeyword) {
      console.log(`\n❌ [${matchedKeyword}] ${event.title}`);
      console.log(`   연령: ${event.age_ranges?.join(', ') || '없음'}`);

      // 키워드가 포함된 문맥 찾기
      const desc = event.description || '';
      const idx = desc.indexOf(matchedKeyword);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(desc.length, idx + matchedKeyword.length + 30);
        const context = desc.substring(start, end);
        console.log(`   문맥: "...${context}..."`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ 매칭 안 된 정상 이벤트:\n');

  for (const event of events) {
    const text = `${event.title} ${event.description || ''}`;
    let matched = false;

    for (const keyword of EXCLUDE_KEYWORDS) {
      if (text.includes(keyword)) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.log(`   - ${event.title} (연령: ${event.age_ranges?.join(', ') || '없음'})`);
    }
  }
}

main();
