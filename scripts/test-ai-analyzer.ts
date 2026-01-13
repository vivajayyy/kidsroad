/**
 * Test script for AI analyzer
 * Claude Haiku API를 사용한 AI 분석을 테스트하는 스크립트
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { searchNaverBlogs, crawlMultipleBlogs } from '../lib/blog-crawler';
import { analyzeBlogs } from '../lib/ai-analyzer';

async function testAIAnalyzer() {
  console.log('=== AI Analyzer Test ===\n');

  // Check environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY must be set in .env.local');
    return;
  }

  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.error(
      '❌ NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in .env.local'
    );
    return;
  }

  console.log('✅ API credentials found\n');

  // Test event
  const eventTitle = '서울어린이대공원 벚꽃축제';
  const searchQuery = `${eventTitle} 후기 유모차 주차 수유실`;

  console.log(`이벤트: ${eventTitle}`);
  console.log(`검색어: ${searchQuery}\n`);

  try {
    // Step 1: Search blogs
    console.log('Step 1: Searching blogs...');
    const blogResults = await searchNaverBlogs(searchQuery, 10);

    if (blogResults.length === 0) {
      console.log('❌ No blogs found');
      return;
    }

    console.log(`✅ Found ${blogResults.length} blogs\n`);

    // Step 2: Crawl blogs (limit to 3 for testing)
    console.log('Step 2: Crawling blog contents...');
    const urlsToCrawl = blogResults.slice(0, 3).map((blog) => blog.link);
    const blogContents = await crawlMultipleBlogs(urlsToCrawl, 2);

    if (blogContents.length === 0) {
      console.log('❌ Failed to crawl any blogs');
      return;
    }

    console.log(`✅ Crawled ${blogContents.length} blogs\n`);

    blogContents.forEach((blog, index) => {
      console.log(`Blog ${index + 1}:`);
      console.log(`  - 제목: ${blog.title.substring(0, 50)}...`);
      console.log(`  - 내용 길이: ${blog.content.length} chars`);
    });

    // Step 3: AI Analysis
    console.log('\nStep 3: Running AI analysis...');
    console.log('(This may take 10-20 seconds)\n');

    const result = await analyzeBlogs(eventTitle, blogContents);

    if (!result) {
      console.log('❌ AI analysis failed');
      return;
    }

    console.log('✅ AI Analysis Result:\n');
    console.log('부모 체크리스트:');
    console.log(`  - 주차: ${result.has_parking === null ? '정보 없음' : result.has_parking ? '가능' : '불가'}`);
    console.log(`  - 유모차: ${result.has_stroller_access === null ? '정보 없음' : result.has_stroller_access ? '접근 가능' : '어려움'}`);
    console.log(`  - 수유실: ${result.has_nursing_room === null ? '정보 없음' : result.has_nursing_room ? '있음' : '없음'}`);
    console.log(`  - 기저귀 교환대: ${result.has_diaper_station === null ? '정보 없음' : result.has_diaper_station ? '있음' : '없음'}`);

    console.log('\n시설 정보:');
    console.log(`  - 실내: ${result.is_indoor === null ? '정보 없음' : result.is_indoor ? '예' : '아니오'}`);
    console.log(`  - 실외: ${result.is_outdoor === null ? '정보 없음' : result.is_outdoor ? '예' : '아니오'}`);

    console.log('\n연령대:');
    console.log(`  - ${result.age_ranges.join(', ')}`);

    console.log('\n분석 메타데이터:');
    console.log(`  - 신뢰도: ${(result.confidence_score * 100).toFixed(1)}%`);
    console.log(`  - 분석한 블로그 수: ${result.source_blog_count}`);
    console.log(`  - 분석 시간: ${result.analyzed_at}`);

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIAnalyzer().catch(console.error);
