/**
 * Check Cron Job Execution Logs
 * Cron 실행 로그를 조회하는 스크립트
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

async function checkCronLogs(limit: number = 10) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Supabase credentials not found');
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  console.log('=== Cron Job 실행 로그 ===\n');

  // Get recent logs
  const { data: logs, error } = await supabase
    .from('cron_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('📋 로그가 없습니다.');
    return;
  }

  console.log(`📋 최근 ${logs.length}개 실행 로그:\n`);

  logs.forEach((log, index) => {
    const executedAt = new Date(log.executed_at);
    const durationSec = log.duration_ms ? (log.duration_ms / 1000).toFixed(1) : 'N/A';
    const successIcon = log.success ? '✅' : '❌';

    console.log(`${index + 1}. ${successIcon} ${log.job_name}`);
    console.log(`   실행 시각: ${executedAt.toLocaleString('ko-KR')}`);
    console.log(`   소요 시간: ${durationSec}초`);
    console.log(`   결과: ${log.message}`);
    console.log(`   통계:`);
    console.log(`     - 전체: ${log.total_items}개`);
    console.log(`     - 처리: ${log.processed_count}개`);
    console.log(`     - Enrichment: ${log.enriched_count}개`);
    console.log(`     - 스킵: ${log.skipped_count}개 (비용 절감)`);
    console.log(`     - 오류: ${log.error_count}개`);

    if (log.metadata) {
      const metadata = log.metadata as any;
      if (metadata.cost_saving_percent !== undefined) {
        console.log(`   💰 비용 절감: ${metadata.cost_saving_percent}%`);
      }
    }

    if (log.errors && Array.isArray(log.errors) && log.errors.length > 0) {
      console.log(`   ⚠️ 오류 목록:`);
      (log.errors as string[]).slice(0, 3).forEach((err) => {
        console.log(`     - ${err}`);
      });
      if (log.errors.length > 3) {
        console.log(`     ... 외 ${log.errors.length - 3}개`);
      }
    }

    console.log('');
  });

  // Statistics
  const successCount = logs.filter((l) => l.success).length;
  const totalEnriched = logs.reduce((sum, l) => sum + (l.enriched_count || 0), 0);
  const totalSkipped = logs.reduce((sum, l) => sum + (l.skipped_count || 0), 0);
  const avgDuration =
    logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / logs.length / 1000;

  console.log('📈 통계 (최근 실행):');
  console.log(`   성공률: ${successCount}/${logs.length} (${((successCount / logs.length) * 100).toFixed(1)}%)`);
  console.log(`   평균 소요 시간: ${avgDuration.toFixed(1)}초`);
  console.log(`   총 Enrichment: ${totalEnriched}개`);
  console.log(`   총 스킵: ${totalSkipped}개`);

  console.log('\n=== 조회 완료 ===');
}

// Command line arguments
const limit = parseInt(process.argv[2]) || 10;
checkCronLogs(limit).catch(console.error);
